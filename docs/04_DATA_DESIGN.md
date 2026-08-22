# 04. Data Design & Entity Schemas — SIH26091

## Relational Schema Specification

### 1. `users`
- `id` (INTEGER, PK, Autoincrement)
- `name` (VARCHAR(100), NOT NULL)
- `email` (VARCHAR(120), UNIQUE, NOT NULL, INDEX)
- `hashed_password` (VARCHAR(255), NOT NULL)
- `phone` (VARCHAR(20), NULLABLE)
- `created_at`, `updated_at` (TIMESTAMP)

### 2. `businesses`
- `id` (INTEGER, PK, Autoincrement)
- `owner_id` (INTEGER, FK -> users.id, NOT NULL, INDEX)
- `name` (VARCHAR(150), NOT NULL, INDEX)
- `type` (VARCHAR(50), NOT NULL)
- `industry` (VARCHAR(50), NOT NULL)
- `location_village`, `location_district`, `location_state`, `location_pin` (VARCHAR)
- `monthly_revenue_estimate`, `monthly_expense_estimate` (NUMERIC(12, 2))
- `created_at`, `updated_at` (TIMESTAMP)

### 3. `transactions`
- `id` (INTEGER, PK, Autoincrement)
- `business_id` (INTEGER, FK -> businesses.id, NOT NULL, INDEX)
- `transaction_date` (DATE, NOT NULL, INDEX)
- `amount` (NUMERIC(12, 2), NOT NULL — positive=inflow, negative=outflow)
- `category` (VARCHAR(50), NOT NULL)
- `description` (TEXT, NULLABLE)
- `created_at` (TIMESTAMP)

### 4. `receivables`
- `id` (INTEGER, PK, Autoincrement)
- `business_id` (INTEGER, FK -> businesses.id, NOT NULL, INDEX)
- `customer_name` (VARCHAR(100), NOT NULL)
- `invoice_number` (VARCHAR(50), NOT NULL)
- `amount` (NUMERIC(12, 2), NOT NULL)
- `due_date`, `expected_date` (DATE, NOT NULL)
- `status` (VARCHAR(20), DEFAULT 'pending')
- `reliability_score` (FLOAT, DEFAULT 1.0)
- `created_at` (TIMESTAMP)

### 5. `payables`
- `id` (INTEGER, PK, Autoincrement)
- `business_id` (INTEGER, FK -> businesses.id, NOT NULL, INDEX)
- `vendor_name` (VARCHAR(100), NOT NULL)
- `bill_number` (VARCHAR(50), NULLABLE)
- `amount` (NUMERIC(12, 2), NOT NULL)
- `due_date` (DATE, NOT NULL)
- `priority_tier` (INTEGER, DEFAULT 1 — 1=Critical, 3=Flexible)
- `status` (VARCHAR(20), DEFAULT 'unpaid')
- `created_at` (TIMESTAMP)

### 6. `expenses`
- `id` (INTEGER, PK, Autoincrement)
- `business_id` (INTEGER, FK -> businesses.id, NOT NULL, INDEX)
- `category` (VARCHAR(50), NOT NULL)
- `amount` (NUMERIC(12, 2), NOT NULL)
- `frequency` (VARCHAR(20), DEFAULT 'monthly')
- `is_recurring` (BOOLEAN, DEFAULT True)
- `created_at` (TIMESTAMP)

### 7. `business_goals`
- `id` (INTEGER, PK, Autoincrement)
- `business_id` (INTEGER, FK -> businesses.id, NOT NULL, INDEX)
- `title` (VARCHAR(150), NOT NULL)
- `target_amount` (NUMERIC(12, 2), NOT NULL)
- `current_amount` (NUMERIC(12, 2), DEFAULT 0.00)
- `deadline` (DATE, NULLABLE)
- `priority`, `status` (VARCHAR(20))
- `created_at`, `updated_at` (TIMESTAMP)
