<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Services\Reports\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

use App\Models\ReportLog;

class ReportController extends Controller
{
    protected ReportService $reportService;

    public function __construct(ReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    public function generationStatus(): JsonResponse
    {
        $exists = ReportLog::whereDate('date', today())->exists();
        return response()->json(['generated' => $exists]);
    }

    public function markGenerated(): JsonResponse
    {
        $log = ReportLog::firstOrCreate(
            ['date' => today()],
            ['generated_by_user_id' => auth()->id()]
        );
        return response()->json(['success' => true, 'log' => $log]);
    }

    /**
     * Sales Summary Report.
     */
    public function salesSummary(Request $request): JsonResponse
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');
        $data = $this->reportService->getSalesSummary($startDate, $endDate);
        return response()->json($data);
    }

    /**
     * Product Performance Report.
     */
    public function productPerformance(Request $request): JsonResponse
    {
        $deadStockDays = (int) $request->input('dead_stock_days', 30);
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');
        $data = $this->reportService->getProductPerformance($deadStockDays, $startDate, $endDate);
        return response()->json($data);
    }

    /**
     * Refund / Void Analysis.
     */
    public function refundVoidAnalysis(Request $request): JsonResponse
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');
        $data = $this->reportService->getRefundVoidAnalysis($startDate, $endDate);
        return response()->json($data);
    }

    /**
     * Customer Log (purchasing value leaderboard).
     */
    public function customerLog(): JsonResponse
    {
        $data = $this->reportService->getCustomerLog();
        return response()->json($data);
    }

    /**
     * Inventory Summary and filterable list.
     */
    public function inventory(Request $request): JsonResponse
    {
        $data = $this->reportService->getInventorySummary($request->only([
            'category_id', 'status', 'search'
        ]));
        return response()->json($data);
    }

    /**
     * Daily Sales Log for current Cashier.
     */
    public function dailySales(Request $request): JsonResponse
    {
        $cashierId = $request->user()->id;

        $sales = Transaction::with(['customer', 'items.product'])
            ->where('cashier_id', $cashierId)
            ->whereDate('date', today())
            ->latest('date')
            ->get();

        return response()->json($sales);
    }
}
