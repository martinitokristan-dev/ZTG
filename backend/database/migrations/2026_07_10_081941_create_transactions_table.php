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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('si_no', 50)->unique();
            $table->string('or_no', 50)->nullable();
            $table->dateTime('date');
            $table->foreignId('customer_id')->nullable()->constrained('customers')->onDelete('set null');
            $table->foreignId('cashier_id')->constrained('users')->onDelete('restrict');
            $table->integer('total_qty')->default(0);
            $table->decimal('amount', 12, 2)->default(0);
            $table->decimal('amount_tendered', 12, 2)->nullable();
            $table->string('payment_method', 255);
            $table->string('doc_type', 50)->nullable(); // PHP Enum: S.I., D.R., C.I.
            $table->string('status', 50); // PHP Enum: Completed, Refund, Return, Void, Pending, Deposit, Paid, Restocked, Damaged, Security Alert
            $table->string('type', 50)->nullable(); // PHP Enum: sale, reservation, inventory, system
            $table->string('refund_reason', 255)->nullable();
            $table->string('void_reason', 255)->nullable();
            $table->string('action_type', 100)->nullable();
            $table->string('inv_action', 100)->nullable();
            $table->foreignId('approver_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('approval_code', 20)->nullable();
            $table->string('order_ref', 50)->nullable();
            $table->text('internal_notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
