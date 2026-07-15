<?php

namespace App\Services\POS;

use App\Enums\DocType;
use App\Enums\PendingOrderStatus;
use App\Models\Customer;
use App\Models\PendingPurchaseOrder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class PendingOrderService
{
    /**
     * Get all pending orders.
     * Admin sees all; Cashier sees only their own.
     */
    public function getAll(int $cashierId, string $role): Collection
    {
        $query = PendingPurchaseOrder::with(['customer', 'cashier', 'items.product']);

        if ($role !== 'Admin') {
            $query->where('cashier_id', $cashierId);
        }

        return $query->latest()->get();
    }

    /**
     * Park a cart as a pending purchase order.
     */
    public function parkOrder(array $data, int $cashierId): PendingPurchaseOrder
    {
        return DB::transaction(function () use ($data, $cashierId) {
            // Upsert customer by name
            $customer = Customer::firstOrCreate(
                ['name' => $data['customer_name']],
                ['phone' => $data['customer_phone'] ?? null]
            );

            // Calculate totals
            $itemsCount = count($data['cart']);
            $total = array_sum(array_map(fn($item) => $item['price'] * $item['qty'], $data['cart']));

            // Generate PO No
            $poNo = 'PO-' . now()->format('Ymd') . '-' . str_pad(
                PendingPurchaseOrder::whereDate('created_at', today())->count() + 1,
                3, '0', STR_PAD_LEFT
            );

            $order = PendingPurchaseOrder::create([
                'po_no'       => $poNo,
                'date'        => now(),
                'customer_id' => $customer->id,
                'items_count' => $itemsCount,
                'total'       => $total,
                'doc_type'    => $data['doc_type'],
                'cashier_id'  => $cashierId,
                'status'      => PendingOrderStatus::PENDING->value,
            ]);

            // Save each cart item
            foreach ($data['cart'] as $item) {
                $order->items()->create([
                    'product_id' => $item['product_id'],
                    'qty'        => $item['qty'],
                    'price'      => $item['price'],
                ]);
            }

            return $order->load(['customer', 'cashier', 'items.product']);
        });
    }

    /**
     * Delete a pending order. Items cascade via DB constraint.
     */
    public function delete(PendingPurchaseOrder $order): void
    {
        $order->delete();
    }
}
