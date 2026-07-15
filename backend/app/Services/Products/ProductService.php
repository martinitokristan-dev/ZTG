<?php

namespace App\Services\Products;

use App\Enums\ProductStatus;
use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use App\Events\InventoryUpdated;
use App\Events\TransactionCreated;

class ProductService
{
    /**
     * Calculate product status based on stock level.
     * Never overrides a manually 'Disabled' status.
     */
    public function calculateStatus(int $stock, int $alertLimit, ?string $currentStatus = null): string
    {
        // Preserve Disabled status if explicitly set
        if ($currentStatus === ProductStatus::DISABLED->value || $currentStatus === 'Disabled') {
            return 'Disabled';
        }

        if ($stock === 0) {
            return ProductStatus::NO_STOCK->value;
        }

        if ($stock <= $alertLimit) {
            return ProductStatus::LOW_STOCK->value;
        }

        return ProductStatus::ACTIVE->value;
    }

    /**
     * Get all base products (no parent) with optional filters.
     */
    public function getAll(array $filters = []): Collection
    {
        $query = Product::with(['category', 'variantOptions.type', 'variants.variantOptions.type']);

        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('part_no', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('chinese_name', 'like', '%' . $filters['search'] . '%');
            });
        }

        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (!empty($filters['status']) && $filters['status'] !== 'All') {
            if ($filters['status'] === 'Dead Stock') {
                $query->where('is_dead_stock', true);
            } else {
                $query->where('status', $filters['status']);
            }
        }

        return $query->orderBy('name')->get();
    }

    /**
     * Show a single product with all its relationships.
     */
    public function show(int $id): Product
    {
        return Product::with(['category', 'variants.variantOptions.type'])->findOrFail($id);
    }

    /**
     * Create a product, with or without variants.
     * All variant rows reference this base via parent_product_id.
     */
    public function createProduct(array $data): Product
    {
        return DB::transaction(function () use ($data) {
            $alertLimit = $data['alert_limit'] ?? 5;
            $status = $this->calculateStatus($data['stock'], $alertLimit);

            // 1. Save base product
            $baseProduct = Product::create([
                'parent_product_id' => null,
                'name'              => $data['name'],
                'chinese_name'      => $data['chinese_name'] ?? null,
                'part_no'           => $data['part_no'],
                'category_id'       => $data['category_id'],
                'address'           => $data['address'] ?? null,
                'stock'             => $data['stock'],
                'alert_limit'       => $alertLimit,
                'price1'            => $data['price1'],
                'price2'            => $data['price2'],
                'status'            => $status,
                'notes'             => $data['notes'] ?? null,
                'image'             => $data['image'] ?? null,
                'is_dead_stock'     => $data['is_dead_stock'] ?? false,
                'damaged'           => $data['damaged'] ?? 0,
            ]);

            // 2. Save variant rows if provided
            if (!empty($data['variants'])) {
                foreach ($data['variants'] as $variantData) {
                    $variantAlertLimit = $variantData['alert_limit'] ?? $alertLimit;
                    $variantStatus = $this->calculateStatus($variantData['stock'], $variantAlertLimit);

                    $variant = Product::create([
                        'parent_product_id' => $baseProduct->id,
                        'name'              => $variantData['name'],
                        'chinese_name'      => $variantData['chinese_name'] ?? null,
                        'part_no'           => $variantData['part_no'],
                        'category_id'       => $data['category_id'],
                        'address'           => $data['address'] ?? null,
                        'stock'             => $variantData['stock'],
                        'alert_limit'       => $variantAlertLimit,
                        'price1'            => $variantData['price1'],
                        'price2'            => $variantData['price2'],
                        'status'            => $variantStatus,
                        'notes'             => $variantData['notes'] ?? null,
                        'image'             => $variantData['image'] ?? null,
                        'is_dead_stock'     => $variantData['is_dead_stock'] ?? false,
                        'damaged'           => $variantData['damaged'] ?? 0,
                    ]);

                    // 3. Sync junction table for variant option associations
                    if (!empty($variantData['option_ids'])) {
                        $variant->variantOptions()->sync($variantData['option_ids']);
                    }
                }
            }

            return $baseProduct->load(['category', 'variants.variantOptions.type']);
        });
    }

    /**
     * Update an existing product's details.
     * Recalculates status unless Disabled.
     */
    public function updateProduct(Product $product, array $data): Product
    {
        $alertLimit = $data['alert_limit'] ?? $product->alert_limit;

        // Recalculate status unless user explicitly set 'Disabled'
        $status = $data['status'] === 'Disabled'
            ? 'Disabled'
            : $this->calculateStatus($data['stock'], $alertLimit, $data['status']);

        $product->update([
            'name'         => $data['name'],
            'chinese_name' => $data['chinese_name'] ?? null,
            'part_no'      => $data['part_no'],
            'category_id'  => $data['category_id'],
            'address'      => $data['address'] ?? null,
            'stock'        => $data['stock'],
            'alert_limit'  => $alertLimit,
            'price1'       => $data['price1'],
            'price2'       => $data['price2'],
            'status'       => $status,
            'notes'        => $data['notes'] ?? null,
            'image'        => $data['image'] ?? null,
            'is_dead_stock'=> $data['is_dead_stock'] ?? false,
            'damaged'      => $data['damaged'] ?? 0,
        ]);

        return $product->fresh(['category', 'variants.variantOptions.type']);
    }

    /**
     * Delete a product. Related variants cascade via DB constraints.
     */
    public function deleteProduct(Product $product): void
    {
        $product->delete();
    }

    /**
     * Commit a batch restock: increase each product's stock,
     * recalculate statuses, and log one Restocked transaction.
     */
    public function restock(array $restockData, int $userId): Transaction
    {
        $transaction = DB::transaction(function () use ($restockData, $userId) {
            $totalQty = 0;
            $restockEntries = [];

            foreach ($restockData as $entry) {
                $product = Product::findOrFail($entry['product_id']);
                $qty = $entry['qty'];

                $newStock = $product->stock + $qty;
                $newStatus = $this->calculateStatus(
                    $newStock,
                    $product->alert_limit,
                    is_object($product->status) ? $product->status->value : $product->status
                );

                $product->update([
                    'stock'  => $newStock,
                    'status' => $newStatus,
                ]);

                $totalQty += $qty;
                $restockEntries[] = [
                    'product_id' => $product->id,
                    'part_no'    => $product->part_no,
                    'name'       => $product->name,
                    'qty'        => $qty,
                    'new_stock'  => $newStock,
                    'category'   => optional($product->category)->name,
                    'address'    => $product->address,
                ];
            }

            // Generate SI No for restock
            $siNo = 'INV-RESTOCK-' . str_pad(
                Transaction::where('si_no', 'like', 'INV-RESTOCK-%')->count() + 1,
                4, '0', STR_PAD_LEFT
            );

            $transaction = Transaction::create([
                'si_no'          => $siNo,
                'date'           => now(),
                'cashier_id'     => $userId,
                'total_qty'      => $totalQty,
                'amount'         => 0,
                'payment_method' => 'N/A',
                'status'         => TransactionStatus::RESTOCKED->value,
                'type'           => TransactionType::INVENTORY->value,
                'internal_notes' => json_encode($restockEntries),
            ]);

            return $transaction;
        });

        // Dispatch real-time events outside the DB transaction block
        $entries = json_decode($transaction->internal_notes, true) ?: [];
        foreach ($entries as $entry) {
            event(new InventoryUpdated($entry['product_id'], (int) $entry['new_stock']));
        }
        $transaction->load(['cashier']);
        event(new TransactionCreated($transaction));

        return $transaction;
    }

    /**
     * Log damaged stock: reduce stock, increment damaged count, log transaction.
     */
    public function logDamaged(Product $product, array $data, int $userId): Transaction
    {
        $qty = $data['qty'];
        $reason = $data['reason'];

        $currentStock = $product->stock;

        if ($qty > $currentStock) {
            throw ValidationException::withMessages([
                'qty' => ['Damaged quantity cannot exceed available stock (' . $currentStock . ' units).'],
            ]);
        }

        $transaction = DB::transaction(function () use ($product, $qty, $reason, $userId) {
            $newStock = $product->stock - $qty;
            $newStatus = $this->calculateStatus(
                $newStock,
                $product->alert_limit,
                is_object($product->status) ? $product->status->value : $product->status
            );

            $product->update([
                'stock'   => $newStock,
                'damaged' => $product->damaged + $qty,
                'status'  => $newStatus,
            ]);

            $siNo = 'INV-DAMAGED-' . str_pad(
                Transaction::where('si_no', 'like', 'INV-DAMAGED-%')->count() + 1,
                3, '0', STR_PAD_LEFT
            );

            $transaction = Transaction::create([
                'si_no'          => $siNo,
                'date'           => now(),
                'cashier_id'     => $userId,
                'total_qty'      => $qty,
                'amount'         => 0,
                'payment_method' => 'N/A',
                'status'         => TransactionStatus::DAMAGED->value,
                'type'           => TransactionType::INVENTORY->value,
                'internal_notes' => "Moved to damaged ({$qty} units) — {$reason} | Product: {$product->part_no}",
            ]);

            return $transaction;
        });

        // Dispatch real-time events outside the DB transaction block
        event(new InventoryUpdated($product->id, (int) $product->stock));
        $transaction->load(['cashier']);
        event(new TransactionCreated($transaction));

        return $transaction;
    }
}
