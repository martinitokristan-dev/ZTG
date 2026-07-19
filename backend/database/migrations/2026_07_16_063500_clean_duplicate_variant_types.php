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
        // 1. Add canonical_type_id column to support explicit mapping in the UI
        if (!Schema::hasColumn('variant_types', 'canonical_type_id')) {
            Schema::table('variant_types', function (Blueprint $table) {
                // NOTE: onDelete('cascade') is safe for this migration specifically, 
                // but caution should be exercised in future schema edits if types are deleted manually.
                $table->foreignId('canonical_type_id')->nullable()->constrained('variant_types')->onDelete('cascade');
            });
        }

        // 2. Create backup tables outside of the transaction block to avoid implicit commits in MySQL
        if (!Schema::hasTable('backup_variant_types')) {
            Schema::create('backup_variant_types', function (Blueprint $table) {
                $table->unsignedBigInteger('id')->primary();
                $table->string('name', 100);
                $table->unsignedBigInteger('canonical_type_id')->nullable();
                $table->timestamp('created_at')->nullable();
            });
        }

        if (!Schema::hasTable('backup_variant_options')) {
            Schema::create('backup_variant_options', function (Blueprint $table) {
                $table->unsignedBigInteger('id')->primary();
                $table->unsignedBigInteger('variant_type_id');
                $table->string('value', 100);
                $table->timestamp('created_at')->nullable();
            });
        }

        if (!Schema::hasTable('backup_product_variant_values')) {
            Schema::create('backup_product_variant_values', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('product_id');
                $table->unsignedBigInteger('variant_option_id');
                $table->timestamps();
            });
        }

        // Disable foreign key constraints during database operations to avoid errors on legacy orphaned product rows
        Schema::disableForeignKeyConstraints();

        // 3. Perform transactional database operations
        DB::transaction(function () {
            // Backup records if backup tables are empty
            if (DB::table('backup_variant_types')->count() === 0) {
                $rows = DB::table('variant_types')->get();
                foreach ($rows as $row) {
                    DB::table('backup_variant_types')->insert((array)$row);
                }
            }

            if (DB::table('backup_variant_options')->count() === 0) {
                $rows = DB::table('variant_options')->get();
                foreach ($rows as $row) {
                    DB::table('backup_variant_options')->insert((array)$row);
                }
            }

            if (DB::table('backup_product_variant_values')->count() === 0) {
                $rows = DB::table('product_variant_values')->get();
                foreach ($rows as $row) {
                    DB::table('backup_product_variant_values')->insert((array)$row);
                }
            }

            // 4. Resolve and assign canonical types based on name-agnostic timestamp suffix (e.g. "Size 1784174269" -> "Size")
            $types = DB::table('variant_types')->get();
            foreach ($types as $type) {
                // Matches ANY variant name followed by a space and a 9-10 digit Unix timestamp
                if (preg_match('/^(.*?)\s+\d{9,10}$/i', $type->name, $matches)) {
                    // Standardize to Title Case (e.g. "size" -> "Size")
                    $baseName = ucfirst(strtolower($matches[1]));
                    
                    // Case-insensitive query to find or create canonical type (Engine-agnostic)
                    $canonicalId = DB::table('variant_types')
                        ->whereRaw('LOWER(name) = ?', [strtolower($baseName)])
                        ->value('id');

                    if (!$canonicalId) {
                        // Fallback: Rename current row to standardized name if no base exists
                        DB::table('variant_types')->where('id', $type->id)->update(['name' => $baseName]);
                        $canonicalId = $type->id;
                    }

                    DB::table('variant_types')->where('id', $type->id)->update(['canonical_type_id' => $canonicalId]);
                } else {
                    // Standard base type acts as its own canonical reference
                    DB::table('variant_types')->where('id', $type->id)->update(['canonical_type_id' => $type->id]);
                }
            }

            // 5. Map variant options to canonical versions & update junction table references
            $nonCanonicalTypes = DB::table('variant_types')
                ->whereNotNull('canonical_type_id')
                ->whereRaw('id != canonical_type_id')
                ->get();

            foreach ($nonCanonicalTypes as $type) {
                $options = DB::table('variant_options')->where('variant_type_id', $type->id)->get();
                
                foreach ($options as $opt) {
                    // Find or create option under canonical type (case-insensitive)
                    $canonicalOptId = DB::table('variant_options')
                        ->where('variant_type_id', $type->canonical_type_id)
                        ->whereRaw('LOWER(value) = ?', [strtolower($opt->value)])
                        ->value('id');

                    if (!$canonicalOptId) {
                        $canonicalOptId = DB::table('variant_options')->insertGetId([
                            'variant_type_id' => $type->canonical_type_id,
                            'value' => $opt->value,
                            'created_at' => now(),
                        ]);
                    }

                    // Re-point junction records to unified option ID
                    DB::table('product_variant_values')
                        ->where('variant_option_id', $opt->id)
                        ->update(['variant_option_id' => $canonicalOptId]);
                }
            }

            // 6. Clean up duplicate product_variant_values junction rows resulting from mapping
            $duplicates = DB::table('product_variant_values')
                ->select('product_id', 'variant_option_id', DB::raw('COUNT(*) as count'), DB::raw('MIN(id) as keep_id'))
                ->groupBy('product_id', 'variant_option_id')
                ->having('count', '>', 1)
                ->get();

            foreach ($duplicates as $dup) {
                DB::table('product_variant_values')
                    ->where('product_id', $dup->product_id)
                    ->where('variant_option_id', $dup->variant_option_id)
                    ->where('id', '!=', $dup->keep_id)
                    ->delete();
            }

            // 7. Delete duplicate variant options and variant types
            foreach ($nonCanonicalTypes as $type) {
                DB::table('variant_options')->where('variant_type_id', $type->id)->delete();
                DB::table('variant_types')->where('id', $type->id)->delete();
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

        // Restore variant_types
        if (Schema::hasTable('backup_variant_types')) {
            DB::table('variant_types')->truncate();
            $rows = DB::table('backup_variant_types')->get();
            foreach ($rows as $row) {
                DB::table('variant_types')->insert((array)$row);
            }
            Schema::dropIfExists('backup_variant_types');
        }

        // Restore variant_options
        if (Schema::hasTable('backup_variant_options')) {
            DB::table('variant_options')->truncate();
            $rows = DB::table('backup_variant_options')->get();
            foreach ($rows as $row) {
                DB::table('variant_options')->insert((array)$row);
            }
            Schema::dropIfExists('backup_variant_options');
        }

        // Restore product_variant_values
        if (Schema::hasTable('backup_product_variant_values')) {
            DB::table('product_variant_values')->truncate();
            $rows = DB::table('backup_product_variant_values')->get();
            foreach ($rows as $row) {
                DB::table('product_variant_values')->insert([
                    'product_id' => $row->product_id,
                    'variant_option_id' => $row->variant_option_id,
                ]);
            }
            Schema::dropIfExists('backup_product_variant_values');
        }

        Schema::enableForeignKeyConstraints();

        if (Schema::hasColumn('variant_types', 'canonical_type_id')) {
            Schema::table('variant_types', function (Blueprint $table) {
                $table->dropForeign(['canonical_type_id']);
                $table->dropColumn('canonical_type_id');
            });
        }
    }
};
