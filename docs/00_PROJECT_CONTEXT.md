# 00. Project Context — Vittanaya

## Executive Summary
**Vittanaya** is an MSME (Micro, Small, and Medium Enterprises) financial decision-support system designed to address cash-flow volatility, liquidity risks, scenario simulations, and financial decision comparisons. 

Developed by a **six-member engineering team**, Vittanaya provides business owners and financial managers with actionable clarity over cash reserves, short-term liquidity, and the net impact of strategic decisions before commitments are made.

---

## Background & Problem Alignment (S42)
MSMEs represent the backbone of the economy but suffer disproportionately from working capital mismatches. Small business owners frequently struggle with:
1. **Uncertain Cash Flow**: Irregular customer payment timelines combined with rigid operational expenses (payroll, rent, supplier invoices).
2. **Liquidity Blind Spots**: Difficulty calculating actual available runway and impending cash crunches.
3. **Unchecked Decisions**: Lack of simple, interactive simulation tools to compare options (e.g., taking short-term loan vs negotiating supplier extension vs offering early payment discounts).

Vittanaya bridges this gap with a lightweight, reliable decision-support platform.

---

## Engineering Philosophy & Principles
1. **Safe & Incremental Development**: Development proceeds phase-by-phase without premature complexity.
2. **Deterministic & Transparent Math**: Financial formulas, cash runway metrics, and scenario simulations use transparent, auditable calculations powered by Pandas/NumPy.
3. **Beginner-Friendly 6-Member Team Structure**: Codebase components are cleanly separated between `frontend/` (React + Vite + Recharts) and `backend/` (FastAPI + SQLite), allowing all 6 team members to collaborate without merge friction.
4. **Strict Safety Protocol**: Direct commits to `main` are strictly prohibited. All changes require feature branches, automated testing (`pytest`), and code review.

---

## Approved Project Tech Stack

| Layer | Selected Tech | Rationale |
|---|---|---|
| **Backend API** | Python + FastAPI | High performance, automatic OpenAPI documentation, clean async support |
| **Frontend UI** | React + Vite | Fast build cycles, component-driven UI architecture |
| **Styling** | Tailwind CSS | Utility-first, responsive financial dashboard styling |
| **Data Viz** | Recharts | Composable React chart components for financial graphs |
| **Data Processing** | Pandas + NumPy | Fast tabular operations, timeseries aggregations |
| **Testing** | Pytest | Industry standard Python unit & integration testing |
| **Formatting / Linting**| Ruff | Lightning fast Python code linting |
| **Database** | SQLite (Phase 1) $\rightarrow$ PostgreSQL (Future) | Zero setup overhead for MVP, clear migration path |
