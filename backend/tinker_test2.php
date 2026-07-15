<?php
use App\Models\Transaction;
use App\Enums\TransactionStatus;
use App\Enums\TransactionType;

// Check if a GCash transaction exists, if not, create one temporary transaction
$gcashTx = Transaction::where('payment_method', 'like', '%GCash%')->first();
$createdTemp = false;

if (!$gcashTx) {
    echo "No GCash transaction found. Creating one temporary GCash transaction...\n";
    $gcashTx = Transaction::create([
        'si_no' => 'SI-TEMP-GCASH',
        'date' => now(),
        'cashier_id' => 1,
        'total_qty' => 1,
        'amount' => 500,
        'amount_tendered' => 500,
        'payment_method' => 'GCash',
        'status' => TransactionStatus::COMPLETED->value,
        'type' => TransactionType::SALE->value,
    ]);
    $createdTemp = true;
}

$service = app(App\Services\Transactions\TransactionService::class);

echo "\n--- TESTING WITH GCASH FILTER ---\n";
$paginator = $service->getAll(['payment_method' => 'GCash']);
echo "Total found: " . $paginator->total() . "\n";
foreach ($paginator->items() as $item) {
    $statusStr = is_object($item->status) ? $item->status->value : $item->status;
    echo "ID: {$item->id} | SI No: {$item->si_no} | Method: {$item->payment_method} | Status: {$statusStr}\n";
}

echo "\n--- TESTING WITH CASH FILTER ---\n";
$paginator2 = $service->getAll(['payment_method' => 'Cash']);
echo "Total found: " . $paginator2->total() . "\n";
foreach ($paginator2->items() as $item) {
    $statusStr = is_object($item->status) ? $item->status->value : $item->status;
    echo "ID: {$item->id} | SI No: {$item->si_no} | Method: {$item->payment_method} | Status: {$statusStr}\n";
}

// Clean up temporary transaction
if ($createdTemp) {
    $gcashTx->delete();
    echo "\nDeleted temporary GCash transaction.\n";
}
