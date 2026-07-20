<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add a permanent, write-once JSON snapshot of business details at the
     * time each transaction is created.
     *
     * BIR compliance requirement: Business Name, Branch, Address, Contact,
     * Email, TIN, and Tax Rate must reflect the values active on the
     * transaction date — not the current Settings at reprint time.
     *
     * Logo is intentionally excluded: it always renders live from Settings.
     */
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->json('business_snapshot')->nullable()->after('internal_notes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn('business_snapshot');
        });
    }
};
