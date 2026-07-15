<?php

namespace App\Observers;

use App\Models\Transaction;
use App\Services\Notifications\NotificationService;

class TransactionObserver
{
    protected NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Handle the Transaction "saved" event.
     */
    public function saved(Transaction $transaction): void
    {
        // Log transaction notification if newly created or if status has changed
        if ($transaction->wasRecentlyCreated || $transaction->isDirty('status')) {
            $this->notificationService->logTransactionNotification($transaction);
        }
    }
}
