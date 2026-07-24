<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\Category;
use App\Models\Customer;
use App\Models\User;
use Carbon\Carbon;

class SeedScalabilityDataCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:seed-scalability';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seed 250+ heavy equipment parts products and 2,000+ complete transactions for scalability testing.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info("🚀 Starting Scalability Data Seeding (250+ Products, 2,000+ Transactions)...");

        // 1. Get or create Cashier / Admin User ID and Checker ID
        $cashier = User::first();
        $cashierId = $cashier ? $cashier->id : 1;

        $checker = \App\Models\Checker::first();
        if (!$checker) {
            $checker = \App\Models\Checker::create(['name' => 'Default Checker', 'status' => 'Active']);
        }
        $checkerId = $checker->id;

        // 2. Create Categories & Products
        $categoriesData = [
            ['name' => 'Hydraulics', 'prefix' => 'HYD', 'cn' => '液压件', 'parts' => ['Hydraulic Pump', 'Control Valve', 'Hydraulic Cylinder', 'Main Relief Valve', 'Pilot Valve', 'Gear Pump', 'Travel Motor']],
            ['name' => 'Engine Components', 'prefix' => 'ENG', 'cn' => '发动机件', 'parts' => ['Piston Ring Set', 'Cylinder Liner', 'Engine Bearing', 'Connecting Rod', 'Crankshaft', 'Camshaft', 'Fuel Injector', 'Water Pump']],
            ['name' => 'Filters & Fluids', 'prefix' => 'FLT', 'cn' => '滤清器', 'parts' => ['Oil Filter element', 'Fuel Water Separator', 'Hydraulic Return Filter', 'Air Filter Assembly', 'Cabin Air Filter', 'Bypass Filter']],
            ['name' => 'Transmission & Gears', 'prefix' => 'TRN', 'cn' => '传动齿轮', 'parts' => ['Planet Gear', 'Sun Gear', 'Transmission Friction Plate', 'Torque Converter', 'Final Drive Shaft', 'Bevel Gear Set']],
            ['name' => 'Electrical System', 'prefix' => 'ELE', 'cn' => '电器件', 'parts' => ['Starter Motor', 'Alternator 24V', 'Pressure Sensor', 'Solenoid Valve', 'Ignition Switch', 'Temperature Sensor', 'Wiring Harness']],
            ['name' => 'Seals & O-Rings', 'prefix' => 'SEL', 'cn' => '密封件', 'parts' => ['Boom Cylinder Seal Kit', 'Arm Cylinder Seal Kit', 'Bucket Cylinder Seal Kit', 'Skeleton Oil Seal', 'O-Ring Box Set', 'Floating Seal']],
            ['name' => 'Undercarriage Parts', 'prefix' => 'UND', 'cn' => '四轮 profiles', 'parts' => ['Track Roller', 'Carrier Roller', 'Front Idler', 'Sprocket Segment', 'Track Link Assembly', 'Track Shoe Bolt']],
            ['name' => 'Cooling System', 'prefix' => 'COL', 'cn' => '散热系统', 'parts' => ['Radiator Core', 'Oil Cooler', 'Fan Blade', 'Thermostat', 'Cooling Hose Set', 'Expansion Tank']],
            ['name' => 'Braking Systems', 'prefix' => 'BRK', 'cn' => '制动系统', 'parts' => ['Brake Disc', 'Brake Caliper', 'Brake Master Cylinder', 'Parking Brake Lining', 'Brake Valve']],
            ['name' => 'Exhaust & Turbo', 'prefix' => 'EXH', 'cn' => '涡轮增压', 'parts' => ['Turbocharger Assembly', 'Exhaust Manifold', 'Muffler Pipe', 'Turbo Gasket Set', 'Wastegate Actuator']]
        ];

        $categoryMap = [];
        foreach ($categoriesData as $catData) {
            $cat = Category::firstOrCreate(['name' => $catData['name']]);
            $categoryMap[$catData['name']] = [
                'id' => $cat->id,
                'prefix' => $catData['prefix'],
                'cn' => $catData['cn'],
                'parts' => $catData['parts']
            ];
        }

        // Generate 250+ Products
        $this->info("📦 Seeding 250+ Products across 10 Categories...");
        $productInserts = [];
        $now = now()->toDateTimeString();
        $productCounter = 1;

        foreach ($categoryMap as $catName => $meta) {
            foreach ($meta['parts'] as $basePart) {
                for ($v = 1; $v <= 4; $v++) {
                    $partNo = sprintf("%s-%s-%04d-%d", $meta['prefix'], strtoupper(substr(str_replace(' ', '', $basePart), 0, 4)), $productCounter, rand(1000, 9999));
                    $price1 = rand(50, 450) * 10; // Price range: ₱500 to ₱4,500
                    $price2 = round($price1 * 0.85, 2); // Wholesale price
                    $stock = rand(15, 250);
                    $alertLimit = rand(5, 20);
                    $rack = chr(rand(65, 72)); // A to H
                    $shelf = rand(1, 12);

                    $productInserts[] = [
                        'name'              => "{$basePart} Spec-v{$v}",
                        'chinese_name'      => $meta['cn'],
                        'part_no'           => $partNo,
                        'category_id'       => $meta['id'],
                        'address'           => "Rack {$rack}-{$shelf}",
                        'stock'             => $stock,
                        'alert_limit'       => $alertLimit,
                        'price1'            => $price1,
                        'price2'            => $price2,
                        'status'            => 'Active',
                        'is_dead_stock'     => false,
                        'damaged'           => 0,
                        'created_at'        => $now,
                        'updated_at'        => $now,
                    ];
                    $productCounter++;
                }
            }
        }

        // Insert products in bulk
        DB::transaction(function () use ($productInserts) {
            foreach (array_chunk($productInserts, 100) as $chunk) {
                DB::table('products')->insertOrIgnore($chunk);
            }
        });

        $productIds = DB::table('products')->pluck('id')->toArray();
        $this->info("✅ Successfully seeded " . count($productIds) . " products!");

        // 3. Create 50+ Customers
        $this->info("👥 Seeding 50+ Customers...");
        $customerNames = [
            'Juan Dela Cruz', 'Maria Santos', 'Antonio Reyes', 'Grace Tan', 'Kenji Sato',
            'Alex Lim', 'Robert Garcia', 'Angie Bautista', 'Jane Smith', 'David Miller',
            'Michael Chang', 'Sarah Jenkins', 'Carlos Mendoza', 'Viktor Petrov', 'Elena Rostova',
            'Ramon Sy', 'Bernadette Co', 'Fernando Poe', 'Gideon Cross', 'Hannah Abbott',
            'Heavy Equipment Rentals Inc.', 'Mindanao Mining Corp', 'Visayas Heavy Logistics',
            'Northern Transport Fleet', 'Agri Machinery Depot', 'Goldfields Excavation Ltd.',
            'Apex Builders Supply', 'Metro Construction Supplies', 'Pacific Machinery Parts', 'Red Rock Mining'
        ];

        $customerIds = [];
        foreach ($customerNames as $name) {
            $cust = Customer::firstOrCreate(
                ['name' => $name],
                ['phone' => '09' . rand(100000000, 999999999)]
            );
            $customerIds[] = $cust->id;
        }

        // 4. Create 2,000+ Transactions (Sales, Returns, Refunds, Voids, Pendings)
        $this->info("🧾 Seeding 2,000+ Transactions with line items, returns & refunds...");

        $statuses = ['Completed', 'Completed', 'Completed', 'Completed', 'Completed', 'Completed', 'Completed', 'Completed', 'Refund', 'Return', 'Void', 'Pending'];
        $paymentMethods = ['Cash', 'GCash', 'Bank Transfer', 'P.O. (Pending)', 'Split'];
        $docTypes = ['S.I.', 'C.I.', 'D.R.'];
        $discountTypes = [null, null, null, 'CustomAmount', 'CustomPercent'];

        $totalTransactionsToSeed = 2050;
        $startSiNo = rand(5000, 90000);

        DB::transaction(function () use ($totalTransactionsToSeed, $startSiNo, $productIds, $customerIds, $cashierId, $checkerId, $statuses, $paymentMethods, $docTypes, $discountTypes) {
            $productRecords = DB::table('products')->whereIn('id', array_slice($productIds, 0, 150))->get()->keyBy('id');
            $pKeys = array_keys($productRecords->toArray());

            for ($i = 1; $i <= $totalTransactionsToSeed; $i++) {
                $siNo = sprintf("SI-2026-%05d-%d", $startSiNo + $i, rand(100, 999));
                $date = Carbon::now()->subDays(rand(0, 180))->subMinutes(rand(0, 1440))->toDateTimeString();
                $status = $statuses[array_rand($statuses)];
                $pm = $paymentMethods[array_rand($paymentMethods)];
                $doc = $docTypes[array_rand($docTypes)];
                $cust = $customerIds[array_rand($customerIds)];
                $discType = $discountTypes[array_rand($discountTypes)];

                // Pick 1 to 4 line items
                $numItems = rand(1, 4);
                $chosenProductKeys = (array) array_rand($pKeys, min($numItems, count($pKeys)));
                
                $itemsForTx = [];
                $grossTotal = 0;
                $itemDiscountsSum = 0;

                foreach ($chosenProductKeys as $pK) {
                    $pId = $pKeys[$pK];
                    $prod = $productRecords[$pId];
                    $qty = rand(1, 5);
                    $price = (float)$prod->price1;
                    $itemDisc = (rand(1, 10) > 7) ? (rand(1, 10) * 10) : 0; // 30% chance of item discount
                    
                    $grossTotal += ($price * $qty);
                    $itemDiscountsSum += ($itemDisc * $qty);

                    $itemsForTx[] = [
                        'product_id'     => $pId,
                        'qty'            => $qty,
                        'price'          => $price,
                        'original_price' => $price,
                        'discount'       => $itemDisc,
                        'price_tier'     => 'price1',
                        'unit'           => 'pc'
                    ];
                }

                $orderDisc = 0;
                $discRate = 0;
                if ($discType === 'CustomPercent') {
                    $discRate = 5 * rand(1, 4); // 5%, 10%, 15%, 20%
                    $orderDisc = round(($grossTotal - $itemDiscountsSum) * ($discRate / 100), 2);
                } elseif ($discType === 'CustomAmount') {
                    $orderDisc = rand(2, 20) * 20; // ₱40 to ₱400
                }

                $finalAmount = max(0, $grossTotal - $itemDiscountsSum - $orderDisc);

                $txId = DB::table('transactions')->insertGetId([
                    'si_no'             => $siNo,
                    'date'              => $date,
                    'customer_id'       => $cust,
                    'cashier_id'        => $cashierId,
                    'checker_id'        => $checkerId,
                    'total_qty'         => array_sum(array_column($itemsForTx, 'qty')),
                    'amount'            => $finalAmount,
                    'discount_amount'   => $orderDisc,
                    'discount_type'     => $discType,
                    'discount_rate'     => $discRate,
                    'amount_tendered'   => $pm === 'P.O. (Pending)' ? 0 : ($finalAmount + rand(0, 50) * 10),
                    'payment_method'    => $pm,
                    'doc_type'          => $doc,
                    'status'            => $status,
                    'type'              => 'sale',
                    'refund_reason'     => ($status === 'Refund' || $status === 'Return') ? 'Customer requested exchange / parts mismatch' : null,
                    'void_reason'       => $status === 'Void' ? 'Duplicate cashier entry cancelled' : null,
                    'created_at'        => $date,
                    'updated_at'        => $date,
                ]);

                foreach ($itemsForTx as $it) {
                    $it['transaction_id'] = $txId;
                    DB::table('transaction_items')->insert($it);
                }
            }
        });

        $totalTxCount = DB::table('transactions')->count();
        $totalItemCount = DB::table('transaction_items')->count();
        $totalProdCount = DB::table('products')->count();

        $this->info("🎉 Scalability Data Seeding Completed!");
        $this->info("   - Total Products in Database: {$totalProdCount}");
        $this->info("   - Total Transactions in Database: {$totalTxCount}");
        $this->info("   - Total Line Items in Database: {$totalItemCount}");

        return 0;
    }
}
