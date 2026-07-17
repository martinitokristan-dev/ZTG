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
    public function getSalesSummary($startDate = null, $endDate = null): array
    {
        $completedQuery = Transaction::where('status', 'Completed');

        if ($startDate && $endDate) {
            $completedQuery->whereBetween('date', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
        }

        $totalRevenue = (float) $completedQuery->sum('amount');
        $txCount = $completedQuery->count();
        $averageTx = $txCount > 0 ? round($totalRevenue / $txCount, 2) : 0.00;

        // Total items sold
        $itemsQuery = TransactionItem::join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            ->where('transactions.status', 'Completed');
        if ($startDate && $endDate) {
            $itemsQuery->whereBetween('transactions.date', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
        }
        $totalItemsSold = (int) $itemsQuery->sum('transaction_items.qty');

        // Top cashier
        $topCashierQuery = Transaction::select('cashier_id', DB::raw('SUM(amount) as total_sales'))
            ->where('status', 'Completed');
        if ($startDate && $endDate) {
            $topCashierQuery->whereBetween('date', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
        }
        $topCashierRow = $topCashierQuery
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
        $paymentMethodsQuery = Transaction::select('payment_method', DB::raw('SUM(amount) as total_sales'), DB::raw('COUNT(*) as tx_count'))
            ->where('status', 'Completed');
        if ($startDate && $endDate) {
            $paymentMethodsQuery->whereBetween('date', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
        }
        $paymentMethods = $paymentMethodsQuery
            ->groupBy('payment_method')
            ->get()
            ->map(fn($row) => [
                'name'           => $row->payment_method,
                'amount'         => (float) $row->total_sales,
                'count'          => (int) $row->tx_count,
            ])
            ->toArray();

        // Last 7 days revenue trend (Dashboard chart uses this)
        $sevenDaysAgo = today()->subDays(6);
        $trendRaw = Transaction::select(DB::raw('DATE(date) as day_date'), DB::raw('SUM(amount) as revenue'))
            ->where('status', 'Completed')
            ->where('date', '>=', $sevenDaysAgo)
            ->groupBy(DB::raw('DATE(date)'))
            ->get();
        
        $trendMap = $trendRaw->keyBy('day_date');
        $last7Days = [];
        for ($i = 6; $i >= 0; $i--) {
            $dateStr = today()->subDays($i)->format('Y-m-d');
            $dayName = today()->subDays($i)->format('D');
            $last7Days[] = [
                'date' => $dateStr,
                'day' => $dayName,
                'revenue' => isset($trendMap[$dateStr]) ? (float) $trendMap[$dateStr]->revenue : 0,
            ];
        }

        // Transactions list for the table
        $transactionsQuery = Transaction::with(['items.product', 'customer', 'cashier']);
        if ($startDate && $endDate) {
            $transactionsQuery->whereBetween('date', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
        }
        $transactions = $transactionsQuery->orderByDesc('date')->get();

        return [
            'total_revenue'      => $totalRevenue,
            'transaction_count'  => $txCount,
            'average_transaction'=> $averageTx,
            'total_items_sold'   => $totalItemsSold,
            'top_cashier'        => $topCashier,
            'revenue_by_payment' => $paymentMethods,
            'last_7_days'        => $last7Days,
            'transactions'       => $transactions,
        ];
    }

    public function getProductPerformance(int $deadStockDays = 30, $startDate = null, $endDate = null): array
    {
        // Top 10 selling products (computed from transactions in date range)
        $topSellersQuery = TransactionItem::select('product_id', DB::raw('SUM(qty) as sales_count'))
            ->join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            ->where('transactions.status', 'Completed');
        if ($startDate && $endDate) {
            $topSellersQuery->whereBetween('transactions.date', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
        }
        $topSellers = $topSellersQuery->groupBy('product_id')
            ->orderByDesc('sales_count')
            ->limit(10)
            ->get()
            ->map(function ($row) use ($startDate, $endDate) {
                $prod = Product::find($row->product_id);
                
                // Get returns and refunds for this product in the date range
                $retRefQuery = TransactionItem::join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
                    ->where('product_id', $row->product_id);
                if ($startDate && $endDate) {
                    $retRefQuery->whereBetween('transactions.date', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
                }
                
                $returns = (clone $retRefQuery)->where('transactions.status', 'Return')->sum('qty');
                $refunds = (clone $retRefQuery)->where('transactions.status', 'Refund')->sum('qty');

                return [
                    'product_id'    => $row->product_id,
                    'name'          => $prod ? $prod->name : 'Deleted Product',
                    'part_no'       => $prod ? $prod->part_no : 'N/A',
                    'category'      => $prod && $prod->category ? $prod->category->name : 'Uncategorized',
                    'sales_count'   => (int) $row->sales_count,
                    'stock'         => $prod ? $prod->stock : 0,
                    'returns_count' => (int) $returns,
                    'refunds_count' => (int) $refunds,
                    'damaged_count' => $prod ? $prod->damaged : 0, // Using absolute damaged stock count
                ];
            })
            ->toArray();

        // Revenue per product (from Completed transactions)
        $revenuePerProductQuery = TransactionItem::select('product_id', DB::raw('SUM(transaction_items.price * transaction_items.qty) as revenue'))
            ->join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            ->where('transactions.status', 'Completed');
        if ($startDate && $endDate) {
            $revenuePerProductQuery->whereBetween('transactions.date', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
        }
        $revenuePerProduct = $revenuePerProductQuery->groupBy('product_id')
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

        // Calculate store-wide totals for items (not transactions)
        $returnsQtyQuery = TransactionItem::join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            ->where('transactions.status', 'Return');
        if ($startDate && $endDate) {
            $returnsQtyQuery->whereBetween('transactions.date', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
        }
        $totalReturnsQty = (int) $returnsQtyQuery->sum('transaction_items.qty');

        $refundsQtyQuery = TransactionItem::join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            ->where('transactions.status', 'Refund');
        if ($startDate && $endDate) {
            $refundsQtyQuery->whereBetween('transactions.date', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
        }
        $totalRefundsQty = (int) $refundsQtyQuery->sum('transaction_items.qty');

        $totalDamaged = (int) Product::sum('damaged');

        return [
            'top_sellers'         => $topSellers,
            'revenue_per_product' => $revenuePerProduct,
            'dead_stock'          => $deadStock,
            'fast_moving'         => $fastMoving,
            'totals'              => [
                'returns_qty' => $totalReturnsQty,
                'refunds_qty' => $totalRefundsQty,
                'damaged_qty' => $totalDamaged,
            ],
        ];
    }

    /**
     * Get Refund and Void metrics.
     */
    public function getRefundVoidAnalysis($startDate = null, $endDate = null): array
    {
        $refundQuery = Transaction::whereIn('status', ['Refund', 'Return']);
        $voidQuery = Transaction::where('status', 'Void');

        if ($startDate && $endDate) {
            $refundQuery->whereBetween('date', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
            $voidQuery->whereBetween('date', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
        }

        $refundCount = $refundQuery->count();
        $voidCount = $voidQuery->count();
        $refundAmount = (float) $refundQuery->sum('amount');

        // Top refund reasons
        $topRefundReasonsQuery = Transaction::select('refund_reason', DB::raw('COUNT(*) as count'))
            ->whereIn('status', ['Refund', 'Return'])
            ->whereNotNull('refund_reason');
        if ($startDate && $endDate) {
            $topRefundReasonsQuery->whereBetween('date', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
        }
        $topRefundReasons = $topRefundReasonsQuery
            ->groupBy('refund_reason')
            ->orderByDesc('count')
            ->get()
            ->toArray();

        // Top void reasons
        $topVoidReasonsQuery = Transaction::select('void_reason', DB::raw('COUNT(*) as count'))
            ->where('status', 'Void')
            ->whereNotNull('void_reason');
        if ($startDate && $endDate) {
            $topVoidReasonsQuery->whereBetween('date', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
        }
        $topVoidReasons = $topVoidReasonsQuery
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
        $sellableQuery = Product::where(function ($q) {
            $q->whereNotNull('parent_product_id')
              ->orWhere(function ($sub) {
                  $sub->whereNull('parent_product_id')
                      ->where(function ($sub2) {
                          $sub2->where('stock', '>', 0)
                               ->orWhereDoesntHave('variants');
                      });
              });
        });

        $totalProducts = (clone $sellableQuery)->count();
        $activeCount = (clone $sellableQuery)->where('status', 'Active')->count();
        $lowStockCount = (clone $sellableQuery)->where(function ($q) {
            $q->where('stock', '>', 0)
              ->whereRaw('stock <= IFNULL(alert_limit, 5)');
        })->count();
        $outOfStockCount = (clone $sellableQuery)->where('stock', 0)->count();

        // 2. Query products with filters
        $query = Product::with(['category', 'variants.variantOptions.type'])
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
                  ->orWhere('part_no', 'like', '%' . $filters['search'] . '%')
                  ->orWhereHas('variants', function ($sub) use ($filters) {
                      $sub->where('name', 'like', '%' . $filters['search'] . '%')
                          ->orWhere('part_no', 'like', '%' . $filters['search'] . '%');
                  });
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
