<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$tx = App\Models\Transaction::where('status', 'Completed')->first();
if ($tx) {
    $tx->created_at = now();
    $tx->save();
    echo "Updated transaction {$tx->id} created_at to now.\n";
} else {
    echo "No completed transactions found.\n";
}
