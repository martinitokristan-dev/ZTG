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
        Schema::table('transactions', function (Blueprint $table) {
            if (!Schema::hasColumn('transactions', 'discount_amount')) {
                $table->decimal('discount_amount', 12, 2)->default(0)->after('amount');
            }
            if (!Schema::hasColumn('transactions', 'discount_type')) {
                $table->string('discount_type', 50)->nullable()->after('discount_amount');
            }
            if (!Schema::hasColumn('transactions', 'discount_rate')) {
                $table->decimal('discount_rate', 8, 2)->default(0)->after('discount_type');
            }
        });

        Schema::table('transaction_items', function (Blueprint $table) {
            if (!Schema::hasColumn('transaction_items', 'original_price')) {
                $table->decimal('original_price', 12, 2)->nullable()->after('price');
            }
            if (!Schema::hasColumn('transaction_items', 'discount')) {
                $table->decimal('discount', 12, 2)->default(0)->after('original_price');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['discount_amount', 'discount_type', 'discount_rate']);
        });

        Schema::table('transaction_items', function (Blueprint $table) {
            $table->dropColumn(['original_price', 'discount']);
        });
    }
};
