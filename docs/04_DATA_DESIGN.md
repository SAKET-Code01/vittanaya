# 04. Data Design & Schema Specification — Vittanaya

## Relational Entity-Relationship Overview

Vittanaya relies on a clean relational schema to store transaction records, receivables, payables, scenario configurations, and user settings.

---

## Database Entities & Fields

### 1. `transactions` (Historical & Confirmed Cash Events)
Tracks actual settled cash inflows and outflows.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique transaction ID |
| `transaction_date` | DATE | NOT NULL | Date cash was realized |
| `amount` | DECIMAL(12,2) | NOT NULL | Positive for inflow, negative for outflow |
| `category` | VARCHAR(50) | NOT NULL | e.g. `revenue`, `payroll`, `rent`, `supplier` |
| `description` | TEXT | NULLABLE | Notes or memo |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation time |

### 2. `receivables` (Expected Cash Inflows)
Tracks outstanding customer invoices and expected collection timelines.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique receivable ID |
| `customer_name` | VARCHAR(100)| NOT NULL | Name of customer |
| `invoice_number` | VARCHAR(50) | NOT NULL | Invoice identifier |
| `amount` | DECIMAL(12,2) | NOT NULL | Invoice amount |
| `due_date` | DATE | NOT NULL | Contractual due date |
| `expected_date` | DATE | NOT NULL | Projected actual collection date |
| `status` | VARCHAR(20) | DEFAULT 'pending' | `pending`, `collected`, `overdue`, `cancelled` |
| `reliability_score`| FLOAT | DEFAULT 1.0 | Historical payment reliability factor (0.0 to 1.0) |

### 3. `payables` (Expected Cash Outflows)
Tracks upcoming vendor liabilities and operational obligations.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique payable ID |
| `vendor_name` | VARCHAR(100)| NOT NULL | Name of supplier / vendor |
| `bill_number` | VARCHAR(50) | NULLABLE | Bill identifier |
| `amount` | DECIMAL(12,2) | NOT NULL | Payable amount |
| `due_date` | DATE | NOT NULL | Obligation due date |
| `priority_tier` | INTEGER | DEFAULT 1 | Priority ranking (1=Critical payroll/rent, 3=Flexible vendor) |
| `status` | VARCHAR(20) | DEFAULT 'unpaid' | `unpaid`, `paid`, `deferred` |

### 4. `scenarios` (What-If Simulation Parameters)
Stores saved user-defined scenario simulation configurations.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique scenario ID |
| `name` | VARCHAR(100)| NOT NULL | Scenario title (e.g., "Major Client 30-Day Delay") |
| `description` | TEXT | NULLABLE | Detailed description of scenario assumptions |
| `delay_days` | INTEGER | DEFAULT 0 | Global receivable delay shift in days |
| `revenue_multiplier`| FLOAT | DEFAULT 1.0 | Percentage adjustment to future sales (e.g. 0.85 = -15%) |
| `additional_expense`| DECIMAL(12,2)| DEFAULT 0.0 | One-time emergency expense cash reduction |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Scenario creation timestamp |

---

## Metric Data Transfer Objects (DTOs)

### `LiquiditySummaryDTO`
- `current_cash_balance`: Total available cash (float).
- `projected_30d_min_balance`: Lowest projected cash balance in next 30 days (float).
- `runway_days`: Number of days cash remains above minimum safety threshold (int).
- `risk_level`: Liquidity risk category (`LOW`, `MEDIUM`, `CRITICAL`).
- `deficit_warnings`: List of dates where projected balance drops below zero or threshold.
