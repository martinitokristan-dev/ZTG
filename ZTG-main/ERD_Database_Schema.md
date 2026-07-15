# ZTG Heavy Parts — ERD Database Schema

> **Purpose:** Copy-paste this schema definition into **Lucid Chart AI** to auto-generate the full ERD.  
> All tables are normalized from the flat `localStorage` JSON structures used in the HTML prototype.

---

## Entity Definitions

### 1. `users`
Stores all system users (Admin, Cashier, Checker, Supervisor).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| `employee_id` | VARCHAR(20) | UNIQUE, NOT NULL | Format: `EMP-000`, `EMP-001` |
| `name` | VARCHAR(100) | NOT NULL | Display name |
| `real_name` | VARCHAR(100) | NOT NULL | Legal/real name |
| `email` | VARCHAR(255) | NULLABLE, UNIQUE | |
| `username` | VARCHAR(50) | UNIQUE, NOT NULL | Login username |
| `password` | VARCHAR(255) | NOT NULL | Hashed (bcrypt in Laravel) |
| `pin` | VARCHAR(10) | NULLABLE | Manager approval PIN |
| `role` | ENUM('Admin','Cashier','Checker','Supervisor') | NOT NULL, DEFAULT 'Cashier' | |
| `status` | ENUM('Active','Inactive') | NOT NULL, DEFAULT 'Active' | |
| `profile_photo` | VARCHAR(500) | NULLABLE | File path or URL |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| `updated_at` | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | |

---

### 2. `categories`
Product categories managed from Settings.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| `name` | VARCHAR(100) | UNIQUE, NOT NULL | e.g. Hydraulics, Filters |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| `updated_at` | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | |

---

### 3. `variant_types`
Defines variant dimensions (e.g. Size, Color, Voltage).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| `name` | VARCHAR(100) | UNIQUE, NOT NULL | e.g. "Size", "Material" |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

---

### 4. `variant_options`
Individual options within a variant type.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| `variant_type_id` | BIGINT UNSIGNED | FK → `variant_types.id`, NOT NULL | |
| `value` | VARCHAR(100) | NOT NULL | e.g. "Standard", "Heavy Duty", "300mm" |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

---

### 5. `products`
Master product catalog. Each variant is its own row (same `name`, different `variant_options`).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| `parent_product_id` | BIGINT UNSIGNED | FK → `products.id`, NULLABLE | NULL = base product; set for variants |
| `name` | VARCHAR(255) | NOT NULL | Product name |
| `chinese_name` | VARCHAR(255) | NULLABLE | Chinese translation |
| `part_no` | VARCHAR(50) | UNIQUE, NOT NULL | Part number (e.g. HP-001) |
| `category_id` | BIGINT UNSIGNED | FK → `categories.id`, NOT NULL | |
| `address` | VARCHAR(50) | NULLABLE | Warehouse location: Aisle-Center-Hang |
| `stock` | INT | NOT NULL, DEFAULT 0 | Current shelf stock |
| `alert_limit` | INT | NOT NULL, DEFAULT 5 | Low stock threshold |
| `price1` | DECIMAL(12,2) | NOT NULL, DEFAULT 0 | Original / wholesale price |
| `price2` | DECIMAL(12,2) | NOT NULL, DEFAULT 0 | Retail price |
| `sales_count` | INT | NOT NULL, DEFAULT 0 | Lifetime units sold |
| `status` | ENUM('Active','Low Stock','No Stock','Disabled') | NOT NULL, DEFAULT 'Active' | |
| `is_dead_stock` | BOOLEAN | DEFAULT FALSE | Flagged as dead stock |
| `damaged` | INT | NOT NULL, DEFAULT 0 | Units marked damaged |
| `variant_options` | VARCHAR(255) | NULLABLE | Display label e.g. "Heavy Duty" |
| `notes` | TEXT | NULLABLE | Internal notes |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| `updated_at` | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | |

---

### 6. `product_variant_values`
Junction table linking a product variant row to its variant option(s).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| `product_id` | BIGINT UNSIGNED | FK → `products.id`, NOT NULL | |
| `variant_option_id` | BIGINT UNSIGNED | FK → `variant_options.id`, NOT NULL | |

**UNIQUE** constraint on (`product_id`, `variant_option_id`).

---

### 7. `customers`
Extracted from inline transaction/reservation customer data.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| `name` | VARCHAR(255) | NOT NULL | |
| `phone` | VARCHAR(30) | NULLABLE | |
| `email` | VARCHAR(255) | NULLABLE | |
| `tin` | VARCHAR(30) | NULLABLE | Buyer TIN for receipts |
| `address` | TEXT | NULLABLE | Buyer address |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| `updated_at` | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | |

---

### 8. `transactions`
Central ledger for ALL transaction types: Sales, Refund, Return, Void, Deposit, Paid, Restocked, Damaged, Security Alert.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| `si_no` | VARCHAR(50) | UNIQUE, NOT NULL | Invoice number: SI-2026-XXX, DR-2026-XXX, CI-2026-XXX, ORD-XXX |
| `or_no` | VARCHAR(50) | NULLABLE | Official receipt no. for refund/return/void |
| `date` | DATETIME | NOT NULL | |
| `customer_id` | BIGINT UNSIGNED | FK → `customers.id`, NULLABLE | |
| `cashier_id` | BIGINT UNSIGNED | FK → `users.id`, NOT NULL | Employee who processed |
| `total_qty` | INT | NOT NULL, DEFAULT 0 | Total quantity across all items |
| `amount` | DECIMAL(12,2) | NOT NULL, DEFAULT 0 | Transaction total |
| `amount_tendered` | DECIMAL(12,2) | NULLABLE | Cash tendered |
| `payment_method` | VARCHAR(255) | NOT NULL | Cash, GCash, Bank, Split details |
| `doc_type` | ENUM('S.I.','D.R.','C.I.') | NULLABLE | Sales Invoice / Delivery Receipt / Charge Invoice |
| `status` | ENUM('Completed','Refund','Return','Void','Pending','Deposit','Paid','Restocked','Damaged','Security Alert') | NOT NULL | |
| `type` | ENUM('sale','reservation','inventory','system') | NULLABLE | Transaction category |
| `refund_reason` | VARCHAR(255) | NULLABLE | Reason for refund/return/void |
| `void_reason` | VARCHAR(255) | NULLABLE | Reason for void specifically |
| `action_type` | VARCHAR(100) | NULLABLE | "Refunded via Cash", "Replaced Item" |
| `inv_action` | VARCHAR(100) | NULLABLE | "Restocked to Shelf", "Moved to Scrap/Damaged" |
| `approver_id` | BIGINT UNSIGNED | FK → `users.id`, NULLABLE | Admin who approved refund/void |
| `approval_code` | VARCHAR(20) | NULLABLE | PIN used for approval |
| `order_ref` | VARCHAR(50) | NULLABLE | FK reference to reservation ORD-XXX |
| `internal_notes` | TEXT | NULLABLE | |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| `updated_at` | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | |

---

### 9. `transaction_items`
Line items for each transaction (sales cart items, refund items, restock entries).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| `transaction_id` | BIGINT UNSIGNED | FK → `transactions.id`, NOT NULL, ON DELETE CASCADE | |
| `product_id` | BIGINT UNSIGNED | FK → `products.id`, NOT NULL | |
| `qty` | INT | NOT NULL | |
| `price` | DECIMAL(12,2) | NOT NULL | Unit price at time of sale |
| `price_tier` | ENUM('price1','price2') | DEFAULT 'price1' | Which price was used |
| `unit` | VARCHAR(20) | DEFAULT 'pc' | Unit of measure |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

---

### 10. `pending_purchase_orders`
Parked/pending purchase orders from the POS module.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| `po_no` | VARCHAR(50) | UNIQUE, NOT NULL | e.g. PO-2026-018 |
| `date` | DATETIME | NOT NULL | |
| `customer_id` | BIGINT UNSIGNED | FK → `customers.id`, NOT NULL | |
| `items_count` | INT | NOT NULL, DEFAULT 0 | |
| `total` | DECIMAL(12,2) | NOT NULL, DEFAULT 0 | |
| `doc_type` | ENUM('S.I.','D.R.','C.I.') | NOT NULL | |
| `cashier_id` | BIGINT UNSIGNED | FK → `users.id`, NOT NULL | |
| `status` | ENUM('Pending','Urgent','Approved','Rejected') | NOT NULL, DEFAULT 'Pending' | |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| `updated_at` | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | |

---

### 11. `pending_po_items`
Line items within a pending purchase order.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| `pending_po_id` | BIGINT UNSIGNED | FK → `pending_purchase_orders.id`, ON DELETE CASCADE | |
| `product_id` | BIGINT UNSIGNED | FK → `products.id`, NOT NULL | |
| `qty` | INT | NOT NULL | |
| `price` | DECIMAL(12,2) | NOT NULL | |

---

### 12. `reservations`
Order-based reservations with multi-item cart support.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| `order_no` | VARCHAR(50) | UNIQUE, NOT NULL | Format: ORD-{timestamp} |
| `customer_id` | BIGINT UNSIGNED | FK → `customers.id`, NOT NULL | |
| `email` | VARCHAR(255) | NULLABLE | |
| `notes` | TEXT | NULLABLE | |
| `payment_method` | VARCHAR(50) | NOT NULL | Cash, GCash, Bank |
| `payment_type` | ENUM('deposit50','full') | NOT NULL | 50% deposit or full payment |
| `deposit` | DECIMAL(12,2) | NOT NULL, DEFAULT 0 | Amount deposited |
| `total` | DECIMAL(12,2) | NOT NULL, DEFAULT 0 | Order total |
| `date` | DATE | NOT NULL | Reservation date |
| `pickup_date` | DATE | NULLABLE | Expected pickup |
| `pickup_time` | TIME | NULLABLE | Expected pickup time |
| `reserved_by_id` | BIGINT UNSIGNED | FK → `users.id`, NOT NULL | Employee who created |
| `fulfilled_by_id` | BIGINT UNSIGNED | FK → `users.id`, NULLABLE | Employee who fulfilled |
| `status` | ENUM('Pending','Completed','Cancelled') | NOT NULL, DEFAULT 'Pending' | |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| `updated_at` | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | |

---

### 13. `reservation_items`
Line items within a reservation order.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| `reservation_id` | BIGINT UNSIGNED | FK → `reservations.id`, ON DELETE CASCADE | |
| `product_id` | BIGINT UNSIGNED | FK → `products.id`, NOT NULL | |
| `qty` | INT | NOT NULL | |
| `price` | DECIMAL(12,2) | NOT NULL | Price at time of reservation |

---

### 14. `notifications`
System-generated alerts (low stock, transactions, reservations).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| `type` | ENUM('low_stock','transaction','reservation') | NOT NULL | |
| `sub_type` | VARCHAR(50) | NULLABLE | sale, refund, void, inventory_restock, etc. |
| `title` | VARCHAR(255) | NOT NULL | |
| `message` | TEXT | NOT NULL | |
| `link` | VARCHAR(255) | NULLABLE | Target page |
| `product_id` | BIGINT UNSIGNED | FK → `products.id`, NULLABLE | For low_stock type |
| `transaction_id` | BIGINT UNSIGNED | FK → `transactions.id`, NULLABLE | For transaction type |
| `is_read` | BOOLEAN | DEFAULT FALSE | |
| `user_id` | BIGINT UNSIGNED | FK → `users.id`, NULLABLE | Target user |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

---

### 15. `archives`
Archived records (cancelled reservations, historical records).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| `reference_id` | VARCHAR(50) | NOT NULL | Original order/tx ID |
| `type` | VARCHAR(100) | NOT NULL | e.g. "Order Cancellation" |
| `details` | TEXT | NOT NULL | |
| `date_archived` | DATE | NOT NULL | |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

---

### 16. `settings`
Key-value store for all system configuration settings.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| `key` | VARCHAR(100) | UNIQUE, NOT NULL | e.g. `business_name`, `tax_rate`, `low_stock_threshold` |
| `value` | TEXT | NULLABLE | |
| `updated_at` | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | |

---

### 17. `alert_rules`
Custom alert rules defined in Settings.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| `name` | VARCHAR(100) | NOT NULL | Rule name |
| `trigger_event` | VARCHAR(100) | NOT NULL | e.g. "Low Stock", "Refund Processed" |
| `is_enabled` | BOOLEAN | DEFAULT TRUE | |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| `updated_at` | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | |

---

## Relationships Summary

```
users (1) ──────< transactions (M)        [cashier_id]
users (1) ──────< transactions (M)        [approver_id]
users (1) ──────< reservations (M)        [reserved_by_id]
users (1) ──────< reservations (M)        [fulfilled_by_id]
users (1) ──────< pending_purchase_orders (M) [cashier_id]
users (1) ──────< notifications (M)       [user_id]

categories (1) ──────< products (M)       [category_id]

products (1) ──────< products (M)         [parent_product_id] (self-ref for variants)
products (1) ──────< transaction_items (M) [product_id]
products (1) ──────< pending_po_items (M)  [product_id]
products (1) ──────< reservation_items (M) [product_id]
products (1) ──────< notifications (M)    [product_id]
products (M) ──────< product_variant_values (M) >────── variant_options (M)

variant_types (1) ──────< variant_options (M) [variant_type_id]

customers (1) ──────< transactions (M)     [customer_id]
customers (1) ──────< reservations (M)     [customer_id]
customers (1) ──────< pending_purchase_orders (M) [customer_id]

transactions (1) ──────< transaction_items (M) [transaction_id]
transactions (1) ──────< notifications (M) [transaction_id]

reservations (1) ──────< reservation_items (M) [reservation_id]

pending_purchase_orders (1) ──────< pending_po_items (M) [pending_po_id]
```

---

## Lucid Chart AI Prompt

> Paste the following into Lucid Chart AI to auto-generate the ERD:

```
Create an Entity Relationship Diagram for a POS and Inventory Management System called "ZTG Heavy Parts" with these tables and relationships:

TABLES:
- users (id PK, employee_id UNIQUE, name, real_name, email, username UNIQUE, password, pin, role ENUM[Admin/Cashier/Checker/Supervisor], status ENUM[Active/Inactive], profile_photo, timestamps)
- categories (id PK, name UNIQUE, timestamps)
- variant_types (id PK, name UNIQUE, created_at)
- variant_options (id PK, variant_type_id FK->variant_types, value, created_at)
- products (id PK, parent_product_id FK->products NULLABLE self-ref, name, chinese_name, part_no UNIQUE, category_id FK->categories, address, stock INT, alert_limit INT, price1 DECIMAL, price2 DECIMAL, sales_count INT, status ENUM[Active/Low Stock/No Stock/Disabled], is_dead_stock BOOL, damaged INT, variant_options VARCHAR, notes TEXT, timestamps)
- product_variant_values (id PK, product_id FK->products, variant_option_id FK->variant_options, UNIQUE[product_id+variant_option_id])
- customers (id PK, name, phone, email, tin, address, timestamps)
- transactions (id PK, si_no UNIQUE, or_no, date DATETIME, customer_id FK->customers, cashier_id FK->users, total_qty INT, amount DECIMAL, amount_tendered DECIMAL, payment_method, doc_type ENUM[S.I./D.R./C.I.], status ENUM[Completed/Refund/Return/Void/Pending/Deposit/Paid/Restocked/Damaged/Security Alert], type ENUM[sale/reservation/inventory/system], refund_reason, void_reason, action_type, inv_action, approver_id FK->users NULLABLE, approval_code, order_ref, internal_notes TEXT, timestamps)
- transaction_items (id PK, transaction_id FK->transactions CASCADE, product_id FK->products, qty INT, price DECIMAL, price_tier ENUM[price1/price2], unit VARCHAR, created_at)
- pending_purchase_orders (id PK, po_no UNIQUE, date DATETIME, customer_id FK->customers, items_count INT, total DECIMAL, doc_type ENUM[S.I./D.R./C.I.], cashier_id FK->users, status ENUM[Pending/Urgent/Approved/Rejected], timestamps)
- pending_po_items (id PK, pending_po_id FK->pending_purchase_orders CASCADE, product_id FK->products, qty INT, price DECIMAL)
- reservations (id PK, order_no UNIQUE, customer_id FK->customers, email, notes TEXT, payment_method, payment_type ENUM[deposit50/full], deposit DECIMAL, total DECIMAL, date DATE, pickup_date DATE, pickup_time TIME, reserved_by_id FK->users, fulfilled_by_id FK->users NULLABLE, status ENUM[Pending/Completed/Cancelled], timestamps)
- reservation_items (id PK, reservation_id FK->reservations CASCADE, product_id FK->products, qty INT, price DECIMAL)
- notifications (id PK, type ENUM[low_stock/transaction/reservation], sub_type, title, message TEXT, link, product_id FK->products NULLABLE, transaction_id FK->transactions NULLABLE, is_read BOOL, user_id FK->users NULLABLE, created_at)
- archives (id PK, reference_id, type, details TEXT, date_archived DATE, created_at)
- settings (id PK, key UNIQUE, value TEXT, updated_at)
- alert_rules (id PK, name, trigger_event, is_enabled BOOL, timestamps)

RELATIONSHIPS:
- users 1:M transactions (cashier_id)
- users 1:M transactions (approver_id)  
- users 1:M reservations (reserved_by_id)
- users 1:M reservations (fulfilled_by_id)
- users 1:M pending_purchase_orders (cashier_id)
- categories 1:M products
- products 1:M products (self-ref parent_product_id for variants)
- products M:M variant_options (through product_variant_values)
- variant_types 1:M variant_options
- customers 1:M transactions
- customers 1:M reservations
- customers 1:M pending_purchase_orders
- transactions 1:M transaction_items
- products 1:M transaction_items
- reservations 1:M reservation_items
- products 1:M reservation_items
- pending_purchase_orders 1:M pending_po_items
- products 1:M pending_po_items

Use crow's foot notation. Group related tables visually.
```
