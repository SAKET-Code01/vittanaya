# 06. GitHub Workflow & Branch Strategy — SIH26091

## Branch Strategy
- `main`: Stable, reviewed code. Direct commits are strictly prohibited.
- `feature/sih26091-foundation`: Active Phase 1 development foundation branch.
- Feature branches: `feature/<feature-name>`
- Bug fix branches: `fix/<issue-name>`

## Pull Request Checklist
1. All Pytest tests pass (`python -m pytest`).
2. Ruff code formatting and linting pass (`python -m ruff check .`).
3. Frontend builds without errors (`npm run build`).
4. Zero secrets, credentials, or private `.env` files committed.
5. All 5 `.ai-memory/` files updated after meaningful engineering events.
