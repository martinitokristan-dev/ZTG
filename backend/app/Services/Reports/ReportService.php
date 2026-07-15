<?php

namespace App\Services\Reports;

use App\Models\Customer;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ReportService
{
    /**
     * Get Sales Summary metrics.
     */
    public function getSalesSummary(): array
    {
        $completedQuery = Transaction::where('status', 'Completed');

        $totalRevenue = (float) $completedQuery->sum('amount');
        $txCount = $completedQuery->count();
        $averageTx = $txCount > 0 ? round($totalRevenue / $txCount, 2) : 0.00;

        // Top cashier
        $topCashierRow = Transaction::select('cashier_id', DB::raw('SUM(amount) as total_sales'))
            ->where('status', 'Completed')
            ->groupBy('cashier_id')
            ->orderByDesc('total_sales')
            ->first();

        $topCashier = null;
        if ($topCashierRow) {
            $cashierUser = User::find($topCashierRow->cashier_id);
            $topCashier = [
                'cashier_id'  => $topCashierRow->cashier_id,
                'name'        => $cashierUser ? $cashierUser->name : 'Unknown',
                'total_sales' => (float) $topCashierRow->total_sales,
            ];
        }

        // Revenue by payment method
        $paymentMethods = Transaction::select('payment_method', DB::raw('SUM(amount) as total_sales'))
            ->where('status', 'Completed')
            ->groupBy('payment_method')
            ->get()
            ->map(fn($row) => [
                'payment_method' => $row->payment_method,
                'total_sales'    => (float) $row->total_sales,
            ])
            ->toArray();

        return [
            'total_revenue'      => $totalRevenue,
            'transaction_count'  => $txCount,
            'average_transaction'=> $averageTx,
            'top_cashier'        => $topCashier,
            'revenue_by_payment' => $paymentMethods,
        ];
    }

    /**
     * Get Product Performance metrics.
     */
    public function getProductPerformance(int $deadStockDays = 30): array
    {
        // Top 10 selling products
        $topSellers = Product::select('id', 'name', 'part_no', 'sales_count', 'stock')
            ->orderByDesc('sales_count')
            ->limit(10)
            ->get()
            ->toArray();

        // Revenue per product (from Completed transactions)
        $revenuePerProduct = TransactionItem::select('product_id', DB::raw('SUM(transaction_items.price * transaction_items.qty) as revenue'))
            ->join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            ->where('transactions.status', 'Completed')
            ->groupBy('product_id')
            ->orderByDesc('revenue')
            ->get()
            ->map(function ($row) {
                $prod = Product::find($row->product_id);
                return [
                    'product_id' => $row->product_id,
                    'name'       => $prod ? $prod->name : 'Deleted Product',
                    'part_no'    => $prod ? $prod->part_no : 'N/A',
                    'revenue'    => (float) $row->revenue,
                ];
            })
            ->toArray();

        // Dead stock (sales_count = 0 and created before X days)
        $deadStock = Product::where('sales_count', 0)
            ->where('created_at', '<', now()->subDays($deadStockDays))
            ->orderBy('name')
            ->get(['id', 'name', 'part_no', 'stock', 'created_at'])
            ->toArray();

        // Fast-Moving items (sales_count >= 8)
        $fastMoving = Product::where('sales_count', '>=', 8)
            ->orderByDesc('sales_count')
            ->get(['id', 'name', 'part_no', 'sales_count', 'stock'])
            ->toArray();

        return [
            'top_sellers'         => $topSellers,
            'revenue_per_product' => $revenuePerProduct,
            'dead_stock'          => $deadStock,
            'fast_moving'         => $fastMoving,
        ];
    }

    /**
     * Get Refund and Void metrics.
     */
    public function getRefundVoidAnalysis(): array
    {
        $refundCount = Transaction::whereIn('status', ['Refund', 'Return'])->count();
        $voidCount = Transaction::where('status', 'Void')->count();

        $refundAmount = (float) Transaction::whereIn('status', ['Refund', 'Return'])->sum('amount');

        // Top refund reasons
        $topRefundReasons = Transaction::select('refund_reason', DB::raw('COUNT(*) as count'))
            ->whereIn('status', ['Refund', 'Return'])
            ->whereNotNull('refund_reason')
            ->groupBy('refund_reason')
            ->orderByDesc('count')
            ->get()
            ->toArray();

        // Top void reasons
        $topVoidReasons = Transaction::select('void_reason', DB::raw('COUNT(*) as count'))
            ->where('status', 'Void')
            ->whereNotNull('void_reason')
            ->groupBy('void_reason')
            ->orderByDesc('count')
            ->get()
            ->toArray();

        return [
            'total_refunds'      => $refundCount,
            'total_voids'        => $voidCount,
            'refund_amount'      => $refundAmount,
            'top_refund_reasons' => $topRefundReasons,
            'top_void_reasons'   => $topVoidReasons,
        ];
    }

    /**
     * Customer Log: customer aggregated purchase stats.
     */
    public function getCustomerLog(): array
    {
        return Transaction::select(
            'customer_id',
            'customers.name',
            'customers.phone',
            DB::raw('COUNT(*) as tx_count'),
            DB::raw('SUM(amount) as total_spent'),
            DB::raw('MIN(date) as first_transaction'),
            DB::raw('MAX(date) as last_transaction')
        )
            ->join('customers', 'transactions.customer_id', '=', 'customers.id')
            ->where('status', 'Completed')
            ->groupBy('customer_id', 'customers.name', 'customers.phone')
            ->orderByDesc('total_spent')
            ->get()
            ->map(fn($row) => [
                'customer_id'         => $row->customer_id,
                'name'                => $row->name,
                'phone'               => $row->phone,
                'tx_count'            => (int) $row->tx_count,
                'total_purchases'     => (int) $row->tx_count,
                'total_spent'         => (float) $row->total_spent,
                'first_purchase_date' => $row->first_transaction,
                'last_purchase_date'  => $row->last_transaction,
                'last_transaction'    => $row->last_transaction,
            ])
            ->toArray();
    }

    /**
     * Inventory Summary & Product Listing.
     */
    public function getInventorySummary(array $filters = []): array
    {
        // 1. Calculate status counts
        $totalProducts = Product::whereNull('parent_product_id')->count();
        $activeCount = Product::whereNull('parent_product_id')->where('status', 'Active')->count();
        $lowStockCount = Product::whereNull('parent_product_id')->where('status', 'Low Stock')->count();
        $outOfStockCount = Product::whereNull('parent_product_id')->where('status', 'No Stock')->count();

        // 2. Query products with filters
        $query = Product::with(['category', 'variants'])
            ->whereNull('parent_product_id');

        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('part_no', 'like', '%' . $filters['search'] . '%');
            });
        }

        $products = $query->orderBy('name')->get();

        return [
            'summary' => [
                'total_products'      => $totalProducts,
                'active_count'        => $activeCount,
                'low_stock_count'     => $lowStockCount,
                'out_of_stock_count'  => $outOfStockCount,
            ],
            'products' => $products,
        ];
    }
}
