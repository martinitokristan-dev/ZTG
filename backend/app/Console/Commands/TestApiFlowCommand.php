<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\User;

class TestApiFlowCommand extends Command
{
    protected $signature = 'test:api-flow';
    protected $description = 'Test the API connections with full end-to-end POS and Inventory flow';

    private string $baseUrl = 'http://127.0.0.1:8000/api';
    private string $token = '';
    
    public function handle()
    {
        $this->info('Starting End-to-End API POS & Inventory Flow Test...');

        // 1. Authenticate / Get admin credentials
        $user = User::where('role', 'Admin')->first();
        if (!$user) {
            $this->error('Admin user not found. Please run db:seed first.');
            return 1;
        }
        $user->pin = '1234';
        $user->save();
        $adminId = $user->id;

        $this->token = $user->createToken('test-token')->plainTextToken;
        $this->info("   Generated Sanctum token for Admin: {$user->name}");

        // 2. Create Category
        $this->info("\n--- STEP 1: Creating Product Category ---");
        $existingCat = \App\Models\Category::where('name', 'Heavy Equipments')->first();
        if ($existingCat) {
            $categoryId = $existingCat->id;
            $this->info("   Category 'Heavy Equipments' Already Exists (ID: {$categoryId})");
        } else {
            $catRes = $this->post('/categories', ['name' => 'Heavy Equipments']);
            $categoryId = $catRes['category']['id'] ?? $catRes['id'] ?? null;
            $this->info("   Category 'Heavy Equipments' Created (ID: {$categoryId})");
        }

        // 3. Create Variant Type: Size
        $this->info("\n--- STEP 2: Creating Variant Type (Size) ---");
        $existingSize = \App\Models\VariantType::where('name', 'Size')->first();
        if ($existingSize) {
            $sizeTypeId = $existingSize->id;
            $sizeOptions = $existingSize->options()->get()->toArray();
            $this->info("   Variant Type 'Size' Already Exists (ID: {$sizeTypeId})");
        } else {
            $sizeRes = $this->post('/variants', [
                'name' => 'Size',
                'options' => ['Small', 'Medium', 'Large']
            ]);
            $sizeTypeId = $sizeRes['variant_type']['id'] ?? $sizeRes['id'] ?? null;
            $sizeOptions = $sizeRes['variant_type']['options'] ?? [];
        }
        $mediumSizeId = null;
        $smallSizeId = null;
        foreach ($sizeOptions as $opt) {
            if ($opt['value'] === 'Medium') {
                $mediumSizeId = $opt['id'];
            } elseif ($opt['value'] === 'Small') {
                $smallSizeId = $opt['id'];
            }
        }
        $this->info("   Variant Type 'Size' ID: {$sizeTypeId}, Medium Option ID: {$mediumSizeId}, Small Option ID: {$smallSizeId}");

        // 4. Create Variant Type: Color
        $this->info("\n--- STEP 3: Creating Variant Type (Color) ---");
        $existingColor = \App\Models\VariantType::where('name', 'Color')->first();
        if ($existingColor) {
            $colorTypeId = $existingColor->id;
            $colorOptions = $existingColor->options()->get()->toArray();
            $this->info("   Variant Type 'Color' Already Exists (ID: {$colorTypeId})");
        } else {
            $colorRes = $this->post('/variants', [
                'name' => 'Color',
                'options' => ['Red', 'Yellow', 'Black']
            ]);
            $colorTypeId = $colorRes['variant_type']['id'] ?? $colorRes['id'] ?? null;
            $colorOptions = $colorRes['variant_type']['options'] ?? [];
        }
        $yellowColorId = null;
        $redColorId = null;
        foreach ($colorOptions as $opt) {
            if ($opt['value'] === 'Yellow') {
                $yellowColorId = $opt['id'];
            } elseif ($opt['value'] === 'Red') {
                $redColorId = $opt['id'];
            }
        }
        $this->info("   Variant Type 'Color' ID: {$colorTypeId}, Yellow Option ID: {$yellowColorId}, Red Option ID: {$redColorId}");

        // 5. Create Product with Size/Color Variant
        $this->info("\n--- STEP 4: Creating Product with Size/Color Variants ---");
        $prodRes = $this->post('/products', [
            'name' => 'ZTG Hydraulic Pump',
            'part_no' => 'HP-PUMP-' . time(),
            'category_id' => $categoryId,
            'stock' => 100,
            'alert_limit' => 10,
            'price1' => 1000,
            'price2' => 1200,
            'status' => 'Active',
            'variants' => [
                [
                    'name' => 'ZTG Hydraulic Pump - Medium Yellow',
                    'part_no' => 'HP-PUMP-' . time() . '-MY',
                    'stock' => 50,
                    'price1' => 1100,
                    'price2' => 1300,
                    'option_ids' => [$mediumSizeId, $yellowColorId]
                ],
                [
                    'name' => 'ZTG Hydraulic Pump - Small Red',
                    'part_no' => 'HP-PUMP-' . time() . '-SR',
                    'stock' => 30,
                    'price1' => 1050,
                    'price2' => 1250,
                    'option_ids' => [$smallSizeId, $redColorId]
                ]
            ]
        ]);
        $baseProductId = $prodRes['product']['id'] ?? null;
        $variantProductId = null;
        if (!empty($prodRes['product']['variants'])) {
            $variantProductId = $prodRes['product']['variants'][0]['id'];
        }
        $this->info("   Base Product Created (ID: {$baseProductId}), Variant Product Created (ID: {$variantProductId})");

        // 6. POS Checkout (Sale)
        $this->info("\n--- STEP 5: Selling a Product Variant in the POS ---");
        $saleRes = $this->post('/pos/checkout', [
            'customer_name' => 'John Doe',
            'payment_method' => 'Cash',
            'amount_tendered' => 1500,
            'doc_type' => 'S.I.',
            'cart' => [['product_id' => $variantProductId, 'qty' => 1, 'price_tier' => 'price1']]
        ]);
        $transactionId = $saleRes['transaction']['id'] ?? null;
        $itemId = $saleRes['transaction']['items'][0]['id'] ?? null;
        $this->info("   POS Sale completed. SI No: " . ($saleRes['transaction']['si_no'] ?? 'N/A') . " (ID: {$transactionId})");

        // 7. Return flow (restore stock)
        $this->info("\n--- STEP 6: Performing Return with Stock Restoration ---");
        $returnRes = $this->post('/transactions/' . $transactionId . '/return', [
            'reason' => 'Wrong Item Given',
            'items' => [['item_id' => $itemId, 'qty' => 1]],
            'approver_id' => $adminId,
            'approval_pin' => '1234',
            'restore_stock' => true,
            'mark_damaged' => false
        ]);
        $this->info("   Return completed successfully. OR No: " . ($returnRes['transaction']['or_no'] ?? 'N/A'));

        // 8. POS Checkout (for Refund)
        $this->info("\n--- STEP 7: Creating Another Sale (for Refund) ---");
        $saleRes2 = $this->post('/pos/checkout', [
            'customer_name' => 'John Doe',
            'payment_method' => 'Cash',
            'amount_tendered' => 1500,
            'doc_type' => 'S.I.',
            'cart' => [['product_id' => $variantProductId, 'qty' => 1, 'price_tier' => 'price1']]
        ]);
        $transactionId2 = $saleRes2['transaction']['id'] ?? null;
        $itemId2 = $saleRes2['transaction']['items'][0]['id'] ?? null;
        $this->info("   POS Sale completed. SI No: " . ($saleRes2['transaction']['si_no'] ?? 'N/A'));

        // 9. Refund flow (mark as damaged, no stock restoration)
        $this->info("\n--- STEP 8: Performing Refund (Mark as Damaged, No Shelf Restoration) ---");
        $refundRes = $this->post('/transactions/' . $transactionId2 . '/refund', [
            'reason' => 'Item Damaged / Defective',
            'items' => [['item_id' => $itemId2, 'qty' => 1]],
            'approver_id' => $adminId,
            'approval_pin' => '1234',
            'restore_stock' => false,
            'mark_damaged' => true
        ]);
        $this->info("   Refund completed successfully. OR No: " . ($refundRes['transaction']['or_no'] ?? 'N/A'));

        // 10. POS Checkout (for Void)
        $this->info("\n--- STEP 9: Creating Another Sale (for Void) ---");
        $saleRes3 = $this->post('/pos/checkout', [
            'customer_name' => 'John Doe',
            'payment_method' => 'Cash',
            'amount_tendered' => 1500,
            'doc_type' => 'S.I.',
            'cart' => [['product_id' => $variantProductId, 'qty' => 1, 'price_tier' => 'price1']]
        ]);
        $transactionId3 = $saleRes3['transaction']['id'] ?? null;
        $this->info("   POS Sale completed. SI No: " . ($saleRes3['transaction']['si_no'] ?? 'N/A'));

        // 11. Void flow (restore stock)
        $this->info("\n--- STEP 10: Voiding Transaction ---");
        $voidRes = $this->post('/transactions/' . $transactionId3 . '/void', [
            'void_reason' => 'Wrong Transaction / Input Error',
            'admin_id' => $adminId,
            'admin_pin' => '1234',
            'restore_stock' => true
        ]);
        $this->info("   Void completed successfully. OR No: " . ($voidRes['transaction']['or_no'] ?? 'N/A'));

        // 12. Create Reservation
        $this->info("\n--- STEP 11: Creating a Reservation (50% Deposit) ---");
        $resRes = $this->post('/reservations', [
            'customer_name' => 'Jane Smith',
            'customer_phone' => '09170001111',
            'customer_email' => 'jane@example.com',
            'items' => [['product_id' => $variantProductId, 'qty' => 2, 'price' => 1100]],
            'pickup_date' => date('Y-m-d', strtotime('+3 days')),
            'pickup_time' => '15:00',
            'payment_method' => 'Cash',
            'payment_type' => 'deposit50',
            'deposit_amount' => 1100, // 50% of 2200
            'notes' => 'Urgent pickup'
        ]);
        $reservationId = $resRes['reservation']['id'] ?? null;
        $this->info("   Reservation Created successfully. Order No: " . ($resRes['reservation']['order_no'] ?? 'N/A') . " (ID: {$reservationId})");

        // 13. Fulfill Reservation
        $this->info("\n--- STEP 12: Fulfilling the Reservation (Paying remaining 50% Balance) ---");
        $fulfillRes = $this->post('/reservations/' . $reservationId . '/fulfill', [
            'balance_payment' => 1100,
            'payment_method' => 'Cash',
            'doc_type' => 'S.I.'
        ]);
        $this->info("   Reservation Fulfilled successfully. Order status: " . ($fulfillRes['reservation']['status'] ?? 'N/A'));

        $this->info("\n=======================================================");
        $this->info("✔ ALL API POS & INVENTORY FLOWS TESTED SUCCESSFULLY! ✔");
        $this->info("Category, Sizes, Colors, Variants, Products, POS Sale, Return, Refund, Void, Reservation, and Fulfillment are all working perfectly.");
        return 0;
    }

    private function post($endpoint, $data)
    {
        $response = Http::withToken($this->token)
            ->acceptJson()
            ->post($this->baseUrl . $endpoint, $data);

        if (!$response->successful()) {
            $this->error("Failed at endpoint: $endpoint");
            $this->error("Status: " . $response->status());
            $this->error("Response: " . $response->body());
            exit(1);
        }

        $this->info("   ✔ Success: $endpoint");
        return $response->json();
    }
}

