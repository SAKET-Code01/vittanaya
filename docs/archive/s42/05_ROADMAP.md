# 05. Engineering Roadmap & Phases — Vittanaya

## Project Roadmap Overview

Development of Vittanaya follows a strictly phased, incremental milestone structure to ensure high quality, complete test coverage, and smooth collaboration among all 6 team members.

---

## Phase Breakdown

```
+-------------------------------------------------------------------------------+
| PHASE 0: Engineering Foundation & Governance (CURRENT PHASE)                  |
| - Branch: feature/agents-governance-and-setup                                 |
| - Governance: AGENTS.md, CONTRIBUTING.md, .env.example                        |
| - Specs: docs/00 to docs/06 engineering specifications                        |
| - Layout: Top-level folders (docs/, frontend/, backend/, data/, ml/, tests/)  |
| - Tooling: Pytest smoke tests & Ruff linting rules                            |
+-------------------------------------------------------------------------------+
                                       |
                                       v
+-------------------------------------------------------------------------------+
| PHASE 1: Core Financial Decision Engine MVP                                   |
| - Backend: FastAPI REST API endpoints & SQLite database setup                 |
| - Engine: Pandas/NumPy forecasting engine & liquidity risk calculator         |
| - Frontend: React + Vite + Tailwind CSS dashboard & Recharts line graph       |
| - Features: Inflow/outflow ledger, 30-day runway projection, warning cards    |
+-------------------------------------------------------------------------------+
                                       |
                                       v
+-------------------------------------------------------------------------------+
| PHASE 2: Scenario Simulation & Action Comparison                              |
| - Engine: What-if scenario simulation engine (delays, sales drop, expense)    |
| - UI: Interactive scenario controls & side-by-side action comparison matrix   |
| - Reporting: Net cash savings summary & decision recommendation score         |
+-------------------------------------------------------------------------------+
                                       |
                                       v
+-------------------------------------------------------------------------------+
| PHASE 3: Hardening & Enterprise Scalability                                   |
| - Database: Migration path from SQLite to PostgreSQL                          |
| - Auth & Roles: Multi-user access control & MSME profile management           |
| - Exporting: PDF/Excel financial report exporting                             |
+-------------------------------------------------------------------------------+
```

---

## Phase 0 Checklist (Current Phase Requirements)

- [x] Create feature branch `feature/agents-governance-and-setup`
- [x] Create `AGENTS.md` specifying all 13 core agent governance rules
- [x] Create `CONTRIBUTING.md` defining git workflow for 6 team members
- [x] Create `.env.example` placeholder template
- [x] Create top-level directory structure (`docs/`, `frontend/`, `backend/`, `data/`, `ml/`, `tests/`)
- [x] Create all 7 core engineering documents (`docs/00_PROJECT_CONTEXT.md` through `docs/06_GITHUB_WORKFLOW.md`)
- [x] Create `pyproject.toml` with Ruff and Pytest configuration
- [x] Create `tests/test_foundation.py` smoke test
- [x] Verify zero main branch modifications and 100% passing tests
