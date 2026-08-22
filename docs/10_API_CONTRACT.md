# 10. API Contract Reference — v1

All endpoints prefixed with `/api/v1`.

## Endpoints

### Health & Status
- `GET /api/v1/health` → Returns API health and version.
- `GET /api/v1/advisory/status` → Returns advisory subsystem readiness status.
- `GET /api/v1/auth/status` → Returns authentication status.

### Business Profiles
- `GET /api/v1/business?business_id=1` → Retrieve business profile.
- `POST /api/v1/business` → Create new rural micro-enterprise profile.
- `PATCH /api/v1/business?business_id=1` → Update business profile fields.

### Dashboard
- `GET /api/v1/dashboard/summary?business_id=1` → Aggregated financial metrics (cash balance, total inflow, total outflow, net cashflow, runway days, liquidity risk level, funding gap).

### Financial Ledger
- `GET /api/v1/finance/transactions?business_id=1&limit=100` → List historical transactions.
- `POST /api/v1/finance/transactions` → Record new transaction.
- `GET /api/v1/finance/receivables?business_id=1` → List customer receivables.
- `POST /api/v1/finance/receivables` → Record new receivable.
- `GET /api/v1/finance/payables?business_id=1` → List supplier payables.
- `POST /api/v1/finance/payables` → Record new payable.
