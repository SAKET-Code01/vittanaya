# 03. System Architecture — Vittanaya

## High-Level Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                  React + Vite Frontend                            |
|                                                                                   |
|  [ Dashboard View ]   [ Forecast Chart (Recharts) ]   [ Scenario Comparison ]     |
|                                       |                                           |
|                                Tailwind CSS UI                                    |
+---------------------------------------+-------------------------------------------+
                                        | HTTP / JSON REST APIs
                                        v
+-----------------------------------------------------------------------------------+
|                                 FastAPI Backend                                   |
|                                                                                   |
|  +--------------------+   +-----------------------+   +------------------------+  |
|  | Ledger Service     |   | Forecasting Engine    |   | Scenario Engine        |  |
|  | (Inflows/Outflows) |   | (Pandas / NumPy)      |   | (Simulation & Compare) |  |
|  +---------+----------+   +-----------+-----------+   +-----------+------------+  |
|            |                          |                           |               |
|            +--------------------------+---------------------------+               |
|                                       |                                           |
|                                SQLAlchemy ORM                                      |
+---------------------------------------+-------------------------------------------+
                                        |
                                        v
+-----------------------------------------------------------------------------------+
|                              SQLite Database (Phase 1)                            |
|                                                                                   |
|   [ Transactions ]   [ Receivables ]   [ Payables ]   [ Scenarios ]               |
+-----------------------------------------------------------------------------------+
```

---

## Architectural Principles

1. **Clean Separation of Concerns**:
   - `frontend/`: Manages UI representation, interactive forms, and charting using React, Vite, Tailwind CSS, and Recharts.
   - `backend/`: Manages API routing, database persistence, and financial data processing using Python, FastAPI, Pandas, and NumPy.
2. **Stateless RESTful API**:
   - FastAPI backend provides JSON REST endpoints.
   - All financial calculations (forecasting, risk metrics, scenario comparison) are executed on-demand via pure, testable backend services.
3. **Relational Data Persistence**:
   - SQLite relational database accessed via SQLAlchemy ORM.
   - Schema designed for straightforward future migration to PostgreSQL.

---

## Backend Directory Structure (`backend/`)

```
backend/
├── app/
│   ├── api/             # FastAPI route handlers (endpoints)
│   ├── core/            # Config, database setup, security
│   ├── engines/         # Financial engines (forecast.py, liquidity.py, simulation.py)
│   ├── models/          # SQLAlchemy database models
│   ├── schemas/         # Pydantic validation schemas
│   └── services/        # Business logic & repository access
├── main.py              # FastAPI application entrypoint
└── requirements.txt     # Backend python dependencies
```

---

## Frontend Directory Structure (`frontend/`)

```
frontend/
├── src/
│   ├── assets/          # Static assets & icons
│   ├── components/      # UI components (cards, tables, chart wrappers)
│   ├── pages/           # Views (Dashboard, Forecast, Scenarios, Settings)
│   ├── services/        # Axios / Fetch API client functions
│   ├── types/           # TypeScript interfaces & types
│   ├── App.jsx          # Root application component
│   └── main.jsx         # Vite entrypoint
├── package.json         # NPM package dependencies
├── tailwind.config.js   # Tailwind CSS configuration
└── vite.config.js       # Vite build configuration
```

---

## Communication & Data Flow

1. **Client Request**: Frontend triggers HTTP requests (e.g. `GET /api/v1/forecast?days=30`).
2. **API Layer**: FastAPI validates query params via Pydantic schemas and forwards parameters to `ForecastingEngine`.
3. **Data Processing**: `ForecastingEngine` reads active ledger entries from SQLite, converts data to Pandas DataFrames, executes timeseries aggregations, and computes daily cash trajectories.
4. **Response**: FastAPI serializes computed timeseries into JSON and responds to frontend.
5. **Visualization**: React components format JSON data and render interactive line/bar graphs using Recharts.
