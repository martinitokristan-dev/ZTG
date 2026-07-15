<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pending_purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->string('po_no', 50)->unique();
            $table->dateTime('date');
            $table->foreignId('customer_id')->constrained('customers')->onDelete('restrict');
            $table->integer('items_count')->default(0);
            $table->decimal('total', 12, 2)->default(0);
            $table->string('doc_type', 50); // PHP Enum: S.I., D.R., C.I.
            $table->foreignId('cashier_id')->constrained('users')->onDelete('restrict');
            $table->string('status', 50)->default('Pending'); // PHP Enum: Pending, Urgent, Approved, Rejected
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pending_purchase_orders');
    }
};
