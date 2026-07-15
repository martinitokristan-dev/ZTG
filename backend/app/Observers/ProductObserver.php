<?php

namespace App\Observers;

use App\Models\Product;
use App\Services\Notifications\NotificationService;

class ProductObserver
{
    protected NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Handle the Product "saved" event.
     */
    public function saved(Product $product): void
    {
        // Only run low stock check if stock or alert_limit has changed
        if ($product->isDirty('stock') || $product->isDirty('alert_limit') || !$product->exists) {
            $this->notificationService->checkStockAlert($product);
        }
    }
}
