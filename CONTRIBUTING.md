# Contributing Guidelines — Vittanaya

Welcome to the **Vittanaya** project repository! This project is being developed by a six-member team. To maintain high code quality, consistency, and beginner-friendly workflows, all team members are expected to follow these guidelines.

---

## 1. Development Workflow

### Branch Naming Conventions
- **Feature Branches**: `feature/<short-description>` (e.g., `feature/agents-governance-and-setup`, `feature/cashflow-forecasting-api`)
- **Bug Fixes**: `fix/<short-description>` (e.g., `fix/liquidity-risk-calculation`)
- **Documentation**: `docs/<short-description>` (e.g., `docs/architecture-update`)

### Branch Protection Rules
- **Never commit directly to `main`.**
- Always branch off `main` to create your feature or fix branch.
- Submit a Pull Request (PR) for review before merging into `main`.

---

## 2. Environment Setup

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd vittanaya
   ```
2. **Set up Python Virtual Environment**:
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # Linux/macOS:
   source .venv/bin/activate
   ```
3. **Copy environment configuration**:
   ```bash
   cp .env.example .env
   ```

---

## 3. Coding & Documentation Standards

- **Python**: Follow PEP 8 guidelines. Use `ruff check .` for linting.
- **Type Annotations**: Add type hints to function parameters and return types.
- **Docstrings**: Include clear, concise docstrings for all modules, classes, and public functions.
- **Commit Messages**: Use semantic commit headers:
  - `feat: add cashflow forecasting endpoints`
  - `fix: resolve liquidity risk calculation edge case`
  - `docs: update product scope documentation`
  - `test: add unit tests for scenario simulation`

---

## 4. Testing Requirements

- Before creating a PR, run tests using `pytest`:
  ```bash
  pytest
  ```
- All tests must pass. Include new unit tests for any new features or bug fixes.

---

## 5. Getting Help & Asking Questions
If you encounter architectural ambiguity, blocking bugs, or schema questions, reach out to the Technical Lead or raise an issue/discussion topic before implementing broad changes.
