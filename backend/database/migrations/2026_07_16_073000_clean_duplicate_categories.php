<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Create backup table outside transaction to avoid implicit commits in MySQL
        if (!Schema::hasTable('backup_categories')) {
            Schema::create('backup_categories', function (Blueprint $table) {
                $table->unsignedBigInteger('id')->primary();
                $table->string('name', 100);
                $table->json('variants')->nullable();
                $table->timestamp('created_at')->nullable();
                $table->timestamp('updated_at')->nullable();
            });
        }

        // Backup mapping of products to their original categories
        if (!Schema::hasTable('backup_product_categories')) {
            Schema::create('backup_product_categories', function (Blueprint $table) {
                $table->unsignedBigInteger('product_id')->primary();
                $table->unsignedBigInteger('category_id');
            });
        }

        Schema::disableForeignKeyConstraints();

        // 2. Perform database operations
        DB::transaction(function () {
            // Backup records if backup table is empty
            if (DB::table('backup_categories')->count() === 0) {
                $rows = DB::table('categories')->get();
                foreach ($rows as $row) {
                    DB::table('backup_categories')->insert((array)$row);
                }
            }

            if (DB::table('backup_product_categories')->count() === 0) {
                $rows = DB::table('products')->select('id', 'category_id')->get();
                foreach ($rows as $row) {
                    DB::table('backup_product_categories')->insert([
                        'product_id' => $row->id,
                        'category_id' => $row->category_id,
                    ]);
                }
            }

            // 3. Resolve and clean duplicate categories
            $categories = DB::table('categories')->get();
            foreach ($categories as $cat) {
                // Matches ANY category name followed by a space and a 9-10 digit Unix timestamp
                if (preg_match('/^(.*?)\s+\d{9,10}$/i', $cat->name, $matches)) {
                    $baseName = trim($matches[1]);
                    
                    // Case-insensitive query to find if canonical category already exists
                    $canonicalId = DB::table('categories')
                        ->whereRaw('LOWER(name) = ?', [strtolower($baseName)])
                        ->value('id');

                    if ($canonicalId) {
                        // Re-point products to the canonical category
                        DB::table('products')
                            ->where('category_id', $cat->id)
                            ->update(['category_id' => $canonicalId]);

                        // Delete duplicate category row
                        DB::table('categories')->where('id', $cat->id)->delete();
                    } else {
                        // Just rename the category row to its base name
                        DB::table('categories')
                            ->where('id', $cat->id)
                            ->update(['name' => $baseName]);
                    }
                }
            }
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::disableForeignKeyConstraints();

        // Restore categories from backup
        if (Schema::hasTable('backup_categories')) {
            DB::table('categories')->truncate();
            $rows = DB::table('backup_categories')->get();
            foreach ($rows as $row) {
                DB::table('categories')->insert((array)$row);
            }
            Schema::dropIfExists('backup_categories');
        }

        // Restore product category mappings
        if (Schema::hasTable('backup_product_categories')) {
            $rows = DB::table('backup_product_categories')->get();
            foreach ($rows as $row) {
                DB::table('products')
                    ->where('id', $row->product_id)
                    ->update(['category_id' => $row->category_id]);
            }
            Schema::dropIfExists('backup_product_categories');
        }

        Schema::enableForeignKeyConstraints();
    }
};
