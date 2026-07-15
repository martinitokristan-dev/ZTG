<?php

namespace Tests\Feature;

use App\Enums\NotificationType;
use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Notification;
use App\Models\Product;
use App\Models\Setting;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PhaseSevenTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $cashier;
    private Category $category;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::create([
            'employee_id' => 'EMP-000',
            'name'        => 'Administrator',
            'real_name'   => 'Admin User',
            'email'       => 'admin@ztg.com',
            'username'    => 'admin',
            'password'    => Hash::make('password'),
            'pin'         => '1234',
            'role'        => UserRole::ADMIN,
            'status'      => UserStatus::ACTIVE,
        ]);

        $this->cashier = User::create([
            'employee_id' => 'EMP-001',
            'name'        => 'Cashier',
            'real_name'   => 'Jane Doe',
            'email'       => 'cashier@ztg.com',
            'username'    => 'cashier',
            'password'    => Hash::make('password'),
            'pin'         => '5678',
            'role'        => UserRole::CASHIER,
            'status'      => UserStatus::ACTIVE,
        ]);

        $this->category = Category::create(['name' => 'Hydraulics']);

        Setting::create(['key' => 'enable_stock_alerts_checkbox', 'value' => 'true']);
        Setting::create(['key' => 'send_low_stock_alerts', 'value' => 'true']);
        Setting::create(['key' => 'send_oos_alerts', 'value' => 'true']);
        Setting::create(['key' => 'enable_transaction_alerts_checkbox', 'value' => 'true']);
    }

    /* ─── Notification Tests ──────────────────────────────── */

    public function test_low_stock_notification_is_generated_when_stock_drops_below_alert_limit()
    {
        $product = Product::create([
            'name'        => 'Hydraulic Valve',
            'part_no'     => 'HV-001',
            'category_id' => $this->category->id,
            'stock'       => 10,
            'alert_limit' => 5,
            'price1'      => 500,
            'price2'      => 550,
            'status'      => 'Active',
        ]);

        // Drop stock to 4 (below alert_limit 5)
        $product->update(['stock' => 4]);

        $this->assertDatabaseHas('notifications', [
            'type'       => NotificationType::LOW_STOCK->value,
            'product_id' => $product->id,
            'title'      => 'Low Stock Alert',
        ]);
    }

    public function test_low_stock_notification_is_auto_deleted_when_product_is_restocked()
    {
        $product = Product::create([
            'name'        => 'Hydraulic Valve',
            'part_no'     => 'HV-001',
            'category_id' => $this->category->id,
            'stock'       => 4,
            'alert_limit' => 5,
            'price1'      => 500,
            'price2'      => 550,
            'status'      => 'Low Stock',
        ]);

        // Triggers initial notification since stock (4) <= alert_limit (5)
        $this->assertDatabaseHas('notifications', [
            'type'       => NotificationType::LOW_STOCK->value,
            'product_id' => $product->id,
        ]);

        // Restock product above alert limit
        $product->update(['stock' => 10]);

        // Notification must be auto-deleted
        $this->assertDatabaseMissing('notifications', [
            'type'       => NotificationType::LOW_STOCK->value,
            'product_id' => $product->id,
        ]);
    }


    public function test_transaction_notifications_generated_automatically()
    {
        $customer = Customer::create(['name' => 'John Doe']);

        $tx = Transaction::create([
            'si_no'          => 'SI-999',
            'date'           => now(),
            'customer_id'    => $customer->id,
            'cashier_id'     => $this->cashier->id,
            'total_qty'      => 1,
            'amount'         => 1000,
            'payment_method' => 'Cash',
            'status'         => TransactionStatus::COMPLETED->value,
            'type'           => TransactionType::SALE->value,
        ]);

        // Should log a transaction notification
        $this->assertDatabaseHas('notifications', [
            'type'           => NotificationType::TRANSACTION->value,
            'transaction_id' => $tx->id,
            'title'          => 'Sale Completed',
        ]);

        // Update status to Void
        $tx->update(['status' => TransactionStatus::VOID->value]);

        // Should log another notification for Void
        $this->assertDatabaseHas('notifications', [
            'type'           => NotificationType::TRANSACTION->value,
            'transaction_id' => $tx->id,
            'title'          => 'Transaction Voided',
        ]);
    }

    public function test_user_can_read_and_delete_notifications()
    {
        $notif = Notification::create([
            'type'    => NotificationType::LOW_STOCK->value,
            'title'   => 'Low Stock Alert',
            'message' => 'Product running low',
        ]);

        // Mark as read
        $response = $this->actingAs($this->cashier)
            ->patchJson("/api/notifications/{$notif->id}/read");

        $response->assertStatus(200);
        $this->assertDatabaseHas('notifications', ['id' => $notif->id, 'is_read' => true]);

        // Read all
        $response = $this->actingAs($this->cashier)
            ->postJson('/api/notifications/read-all');

        $response->assertStatus(200);

        // Delete
        $response = $this->actingAs($this->cashier)
            ->deleteJson("/api/notifications/{$notif->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('notifications', ['id' => $notif->id]);
    }

    /* ─── Log Tests ───────────────────────────────────────── */

    public function test_cashier_can_view_daily_sales()
    {
        $customer = Customer::create(['name' => 'John Doe']);

        Transaction::create([
            'si_no'          => 'SI-DAILY',
            'date'           => now(),
            'customer_id'    => $customer->id,
            'cashier_id'     => $this->cashier->id,
            'total_qty'      => 1,
            'amount'         => 100,
            'payment_method' => 'Cash',
            'status'         => TransactionStatus::COMPLETED->value,
        ]);

        $response = $this->actingAs($this->cashier)
            ->getJson('/api/daily-sales');

        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonFragment(['si_no' => 'SI-DAILY']);
    }

    public function test_cashier_can_view_customer_log()
    {
        $customer = Customer::create(['name' => 'Loyal Customer']);

        Transaction::create([
            'si_no'          => 'SI-CUST',
            'date'           => now(),
            'customer_id'    => $customer->id,
            'cashier_id'     => $this->cashier->id,
            'total_qty'      => 2,
            'amount'         => 500.00,
            'payment_method' => 'Cash',
            'status'         => TransactionStatus::COMPLETED->value,
        ]);

        $response = $this->actingAs($this->cashier)
            ->getJson('/api/customer-log');

        $response->assertStatus(200)
            ->assertJsonFragment(['name' => 'Loyal Customer', 'total_spent' => 500.00]);
    }

    /* ─── Reports & Analytics Tests ───────────────────────── */

    public function test_admin_can_get_sales_summary()
    {
        $customer = Customer::create(['name' => 'Loyal Customer']);

        Transaction::create([
            'si_no'          => 'SI-SUM1',
            'date'           => now(),
            'customer_id'    => $customer->id,
            'cashier_id'     => $this->cashier->id,
            'total_qty'      => 2,
            'amount'         => 500.00,
            'payment_method' => 'Cash',
            'status'         => TransactionStatus::COMPLETED->value,
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/reports/sales-summary');

        $response->assertStatus(200)
            ->assertJsonFragment(['total_revenue' => 500.00, 'transaction_count' => 1]);
    }

    public function test_admin_can_get_product_performance()
    {
        $product = Product::create([
            'name'        => 'Super Valve',
            'part_no'     => 'SV-001',
            'category_id' => $this->category->id,
            'stock'       => 20,
            'sales_count' => 10,
            'price1'      => 100,
            'price2'      => 120,
            'status'      => 'Active',
            'created_at'  => now()->subDays(40), // Old enough to be dead stock if sales_count = 0
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/reports/product-performance');

        $response->assertStatus(200)
            ->assertJsonStructure(['top_sellers', 'revenue_per_product', 'dead_stock', 'fast_moving'])
            ->assertJsonFragment(['name' => 'Super Valve', 'sales_count' => 10]);
    }

    public function test_admin_can_get_refund_void_analysis()
    {
        $customer = Customer::create(['name' => 'John Doe']);

        Transaction::create([
            'si_no'          => 'SI-RFD',
            'date'           => now(),
            'customer_id'    => $customer->id,
            'cashier_id'     => $this->cashier->id,
            'total_qty'      => 1,
            'amount'         => 100,
            'payment_method' => 'Cash',
            'status'         => TransactionStatus::REFUND->value,
            'refund_reason'  => 'Defective',
        ]);

        Transaction::create([
            'si_no'          => 'SI-VOID',
            'date'           => now(),
            'customer_id'    => $customer->id,
            'cashier_id'     => $this->cashier->id,
            'total_qty'      => 1,
            'amount'         => 0,
            'payment_method' => 'Cash',
            'status'         => TransactionStatus::VOID->value,
            'void_reason'    => 'Duplicate',
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/reports/refund-void-analysis');

        $response->assertStatus(200)
            ->assertJsonFragment(['total_refunds' => 1, 'total_voids' => 1]);
    }

    public function test_admin_can_get_inventory_summary()
    {
        $response = $this->actingAs($this->admin)
            ->getJson('/api/inventory');

        $response->assertStatus(200)
            ->assertJsonStructure(['summary', 'products']);
    }

    public function test_cashier_cannot_access_admin_reports()
    {
        $response = $this->actingAs($this->cashier)
            ->getJson('/api/reports/sales-summary');

        $response->assertStatus(403);
    }
}
