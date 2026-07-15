<?php

namespace App\Http\Controllers;

use App\Http\Requests\CheckoutRequest;
use App\Http\Requests\StorePendingOrderRequest;
use App\Models\PendingPurchaseOrder;
use App\Models\Product;
use App\Services\POS\CheckoutService;
use App\Services\POS\PendingOrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PosController extends Controller
{
    protected CheckoutService $checkoutService;
    protected PendingOrderService $pendingOrderService;

    public function __construct(
        CheckoutService $checkoutService,
        PendingOrderService $pendingOrderService
    ) {
        $this->checkoutService = $checkoutService;
        $this->pendingOrderService = $pendingOrderService;
    }

    /**
     * Get products for the POS grid.
     * By default returns all in-stock products; pass ?all=1 for full list.
     */
    public function products(Request $request): JsonResponse
    {
        $query = Product::with(['category', 'variants' => function ($q) {
            $q->where('status', '!=', 'Disabled');
        }])
            ->whereNull('parent_product_id')
            ->where('status', '!=', 'Disabled');

        if (!$request->boolean('all')) {
            $query->where('stock', '>', 0);
        }

        $products = $query->orderBy('name')->get();

        return response()->json($products);
    }

    /**
     * Process a direct checkout (deducts stock, creates transaction).
     */
    public function checkout(CheckoutRequest $request): JsonResponse
    {
        $transaction = $this->checkoutService->processCheckout(
            $request->validated(),
            $request->user()->id
        );

        return response()->json([
            'message'     => 'Checkout completed successfully.',
            'transaction' => $transaction,
        ], 201);
    }

    /**
     * List pending purchase orders (parked carts).
     */
    public function listPendingOrders(Request $request): JsonResponse
    {
        $user = $request->user();
        $role = is_object($user->role) ? $user->role->value : $user->role;

        $orders = $this->pendingOrderService->getAll($user->id, $role);

        return response()->json($orders);
    }

    /**
     * Park a cart as a pending purchase order.
     */
    public function parkOrder(StorePendingOrderRequest $request): JsonResponse
    {
        $order = $this->pendingOrderService->parkOrder(
            $request->validated(),
            $request->user()->id
        );

        return response()->json([
            'message' => 'Order parked successfully.',
            'order'   => $order,
        ], 201);
    }

    /**
     * Delete a parked pending order.
     */
    public function deletePendingOrder(PendingPurchaseOrder $pendingOrder): JsonResponse
    {
        $this->pendingOrderService->delete($pendingOrder);

        return response()->json([
            'message' => 'Pending order removed successfully.',
        ]);
    }
}
