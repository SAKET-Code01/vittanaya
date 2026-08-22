# 02. Product Scope & Boundaries — Vittanaya

## Functional Scope Overview

Vittanaya focuses strictly on delivering core decision-support capabilities for MSME working capital and cash-flow liquidity management.

---

## In-Scope Features (Phases 0 & 1)

### 1. Cash-Flow Ledger & Timeseries Forecasting Engine
- **Inflow Tracking**: Accounts receivable, expected collection dates, invoice status, customer payment reliability ratings.
- **Outflow Tracking**: Accounts payable, recurring operational expenses (payroll, rent, utilities), vendor payment due dates.
- **Cash Position Projection**: Daily and weekly cash balance calculations over a rolling 30-day / 90-day horizon using Pandas/NumPy.

### 2. Liquidity Risk Assessment & Metrics
- **Current Available Cash Balance**: Real-time summary of liquid cash.
- **Cash Runway Days**: Calculation of days until cash balance breaches minimum operating threshold under current inflow/outflow schedules.
- **Deficit & Crunch Alerts**: Visual warning indicators when projected balance drops below safety thresholds.

### 3. Interactive Scenario Simulation Engine
- **"What-If" Modeler**:
  - *Customer Payment Delay*: Simulate customer payment delayed by N days.
  - *Revenue Volatility*: Simulate a percentage reduction (e.g., -20%) in expected monthly sales.
  - *Emergency Expense*: Model a one-time unexpected operational cash outflow.
- **Simulation Outputs**: Instant recalculation of cash flow projection graph and revised runway days.

### 4. Action Comparison Matrix
- **Side-by-Side Decision Comparison**: Compare baseline cash projection against 2 or 3 distinct scenario interventions (e.g., Early Collection Discount vs Vendor Deferral vs Short-Term Credit Line).
- **Net Impact Summary**: Highlight net cash savings, interest cost, and liquidity buffer impact.

---

## Out-of-Scope Capabilities (Strict Exclusions for Phases 0 & 1)

> [!WARNING]
> The following features are **explicitly out of scope** to prevent scope creep and maintain beginner-friendly development across the 6-member team:

1. **Machine Learning (ML)**: No AI/ML forecasting models or automated predictive ML algorithms in Phase 1. All calculations use deterministic financial rules and timeseries mathematics.
2. **External Bank APIs / Open Banking**: No automated bank feeds or live bank API syncing. Data is provided via structured input/CSV import.
3. **OCR / Invoice Document Scanning**: No PDF invoice parsing or optical character recognition.
4. **Streamlit UI**: UI will be built exclusively with React + Vite + Tailwind CSS.
5. **Docker / Containers**: Infrastructure containerization is excluded in Phase 0 & Phase 1.
6. **Redis / In-Memory Caching**: Caching infrastructure is excluded.
7. **MLflow**: No ML pipeline tracking tools.
