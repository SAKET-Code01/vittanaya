# 03. System Architecture — Vittanaya (SIH26091)

## Architecture Diagram

```
+------------------------------------------------------------------------------------+
|                               React 18 + Vite Frontend                             |
|                                                                                    |
|  [ Dashboard View ]   [ Cash Overview ]   [ Profile ]   [ Settings ]   [ Help ]    |
|                                       |                                            |
|                           Frontend Service Layer                                   |
|        (apiClient.js, financeService.js, businessService.js, dataMode.js)          |
+---------------------------------------+--------------------------------------------+
                                        | HTTP REST (JSON)
                                        v
+------------------------------------------------------------------------------------+
|                                FastAPI Backend                                     |
|                                                                                    |
|  +--------------------+   +-----------------------+   +-------------------------+  |
|  | /api/v1/business   |   | /api/v1/dashboard     |   | /api/v1/finance         |  |
|  +---------+----------+   +-----------+-----------+   +------------+------------+  |
|            |                          |                            |               |
|            +--------------------------+----------------------------+               |
|                                       v                                            |
|                              Application Services                                  |
|            (BusinessService, LedgerService, DashboardService, AuthService)         |
|                                       |                                            |
|                     +-----------------+-----------------+                          |
|                     v                                   v                          |
|             Financial Engines                  Repository Layer                    |
|       (Cashflow, Liquidity, Structuring)       (SQLAlchemy 2.0 ORM)                |
+---------------------------------------------------------+--------------------------+
                                                          |
                                                          v
+------------------------------------------------------------------------------------+
|                              SQLite Relational Database                            |
|                                                                                    |
| [ Users ] [ Businesses ] [ Transactions ] [ Receivables ] [ Payables ] [ Expenses ]|
+------------------------------------------------------------------------------------+
```

---

## Directory Structure
```
backend/
├── main.py                     # FastAPI application entrypoint
├── requirements.txt            # Pinned dependencies
├── app/
│   ├── api/v1/endpoints/       # Health, Auth, Business, Dashboard, Finance, Advisory
│   ├── core/                   # config, database, security, logging
│   ├── models/                 # SQLAlchemy 2.0 domain entities
│   ├── schemas/                # Pydantic validation schemas
│   ├── repositories/           # Database access layer
│   ├── services/               # Business logic coordination
│   └── engines/                # Cashflow, Liquidity, Structuring engines
└── tests/                      # Pytest automated test suite
```
