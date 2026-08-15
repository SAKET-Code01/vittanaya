# 06. GitHub Workflow & Team Collaboration — Vittanaya

## Overview

This guide outlines the git branching model, commit conventions, Pull Request (PR) review process, and code quality controls for our **six-member engineering team**.

---

## 1. Branching Strategy

- **`main`**: Production-ready, stable codebase. **DIRECT COMMITS TO `main` ARE STRICTLY PROHIBITED.**
- **Feature Branches**: `feature/<feature-name>` (e.g., `feature/agents-governance-and-setup`, `feature/fastapi-ledger-api`).
- **Fix Branches**: `fix/<bug-name>` (e.g., `fix/runway-calculation-zero-division`).
- **Docs Branches**: `docs/<doc-name>` (e.g., `docs/update-architecture`).

### Branch Creation Process
Before starting any task:
1. Ensure your local `main` is up to date:
   ```bash
   git checkout main
   git pull origin main
   ```
2. Create and switch to your feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

---

## 2. Commit Message Standard

Commits must follow the **Conventional Commits** standard:

- `feat`: A new user-facing feature or API endpoint.
- `fix`: A bug fix.
- `docs`: Documentation changes only.
- `style`: Formatting, missing semi-colons, etc. (no code change).
- `refactor`: Code restructuring without changing external behavior.
- `test`: Adding or updating tests.
- `chore`: Maintenance tasks, config changes, build scripts.

**Example Commit Message**:
```bash
git commit -m "feat: implement liquidity runway days calculation in backend engine"
```

---

## 3. Pull Request (PR) Protocol

1. **Self-Review & Verification**:
   - Run `pytest` to confirm all tests pass.
   - Run `ruff check .` to ensure zero linting errors.
   - Run `git status` to verify no stray or untracked files are included.
2. **Open Pull Request**:
   - Provide a clear PR title and summary of changes.
   - Reference relevant issue or documentation section.
3. **Peer Review**:
   - At least one team member or Technical Lead must review and approve the PR before merging.
4. **Merge Strategy**:
   - Use **Squash and Merge** or **Rebase and Merge** to keep git history clean on `main`.

---

## 4. Safety Controls & Mandatory Prohibitions

> [!CAUTION]
> - **Never Force Push**: `git push --force` is disabled and forbidden.
> - **Never Commit Secrets**: Check passwords, API tokens, and private keys before committing.
> - **Never Bypass Tests**: Disabling tests to force a PR pass is prohibited.
> - **Always Report Changed Files**: Document all created, edited, or deleted files in your PR.
