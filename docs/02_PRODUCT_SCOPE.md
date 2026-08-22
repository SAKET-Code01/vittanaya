# 02. Product Scope & Boundaries — SIH26091

## Phase 1 Scope (Current Engineering Foundation)

### In-Scope:
1. **Core Financial Ledger & APIs**:
   - Transaction recording with strict validation (positive inflow, negative outflow, no zero amounts).
   - Outstanding receivables management with reliability rating.
   - Payables tracking with priority tiers (1=Critical, 3=Flexible).
   - Operational expenses ledger.
2. **Foundational Financial Engines**:
   - `CashflowEngine`: Net cashflow aggregation.
   - `LiquidityEngine`: Operational runway days and risk level (`LOW`, `MEDIUM`, `CRITICAL`).
   - `FinancialStructureEngine`: Working capital funding gap calculation.
3. **Domain Models & Relational Storage**:
   - 7 domain entities in SQLite via SQLAlchemy: User, Business, Transaction, Receivable, Payable, Expense, BusinessGoal.
4. **Frontend Service Layer**:
   - `apiClient.js`, `financeService.js`, `businessService.js`, `advisoryService.js`.
   - Data mode configuration (`DEMO`, `LOCAL`, `API`).
5. **Deterministic Seeding & Testing**:
   - `scripts/seed_demo_data.py` for rural craft workshop demo dataset.
   - 100% passing pytest suite.

### Out-of-Scope (Strictly Prohibited in Phase 1):
- Real-time LLM integration / external AI APIs.
- Automatic live banking integrations / Open Banking.
- OCR invoice scanning.
- Distributed containers / Kubernetes / Kafka / Redis.
- Premature complex ML forecasting models.
