# AGENTS.md — Team & AI Governance Protocol

## Project Context
**Vittanaya** is an MSME financial decision-support system designed to provide cash-flow forecasting, liquidity risk assessment, scenario simulation, and action comparison. This repository is developed by a six-member team. All contributors (human engineers and AI assistants) MUST strictly follow the governance rules below.

---

## Mandates & Core Directives

### 1. Repository Inspection First
- **Always inspect the repository before making any code or documentation changes.**
- Check git branch status, read active documentation, and inspect existing code signatures to prevent conflicts and redundant implementations.

### 2. Read Relevant Documentation
- Read all relevant documentation in `docs/` before implementing any feature or modifying architecture.
- Follow established project guidelines, data schemas, and API contracts defined in `docs/`.

### 3. Follow Current Phase Strictly
- Work strictly within the current active project phase (e.g., Phase 0: Engineering Foundation).
- **Do NOT implement future-phase capabilities** (e.g. ML models, complex external integrations, or unauthorized UI features) unless explicitly instructed.

### 4. Small, Incremental & Reversible Changes
- Make small, atomic, logically isolated changes.
- Avoid large refactors or monolithic pull requests. Every commit should be easy to review, test, and revert if necessary.

### 5. No Unrelated File Changes
- Keep changes tightly scoped to the task at hand.
- Do NOT reformat, edit, or clean up unrelated files, lines, or configurations in a pull request.

### 6. No Invented APIs or Database Fields
- Do NOT invent or hallucinate API endpoints, database schemas, model attributes, or parameters.
- All backend endpoints and data fields must be strictly justified by specifications in `docs/03_ARCHITECTURE.md` and `docs/04_DATA_DESIGN.md`.

### 7. Strict Git & Safety Controls
- **No direct commits to `main`**: All work MUST be performed on dedicated feature branches (`feature/<topic>` or `fix/<topic>`).
- **No destructive Git commands**: `git reset --hard`, `git clean -fd`, or dangerous history mutations are prohibited without explicit lead engineer authorization.
- **No force pushes**: `git push --force` or `--force-with-lease` to shared or main branches is strictly forbidden.

### 8. Zero Secrets in Version Control
- NEVER commit secrets, API keys, passwords, private keys, or actual credentials.
- Use `.env.example` as a template for environment variable placeholders. Local secrets belong strictly in un-tracked `.env` files.

### 9. Testing Required Before PR
- Automated tests (`pytest`) MUST be written and run before opening any Pull Request or proposing code merges.
- All tests must pass cleanly. Never disable or bypass failing tests.

### 10. Transparent Reporting & Verification
- Always report the exact list of modified/created files, dependencies added, and commands executed to verify changes.

### 11. Architectural Escalation Protocol
- **Stop and ask before making major architectural changes**, introducing new frameworks, adding third-party dependencies, or altering core directory layouts.

---

## Approved Technology Stack & Boundaries

| Component | Technology / Library | Phase Notes |
|---|---|---|
| **Backend** | Python + FastAPI | Clean REST API |
| **Frontend** | React + Vite | Single Page Application |
| **Styling** | Tailwind CSS | Utility-first styling |
| **Charts** | Recharts | Financial visualizations |
| **Data Processing** | Pandas + NumPy | Tabular analysis & metrics |
| **Testing** | Pytest | Unit & integration tests |
| **Lint / Format** | Ruff | Python linting & formatting |
| **Database** | SQLite (Phase 1) $\rightarrow$ PostgreSQL (Future) | Relational store |
| **Explicit Out-of-Scope** | ML, Streamlit, Docker, Redis, MLflow, External APIs, OCR | Prohibited in Phase 0 & Phase 1 |
