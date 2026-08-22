# 09. Security Architecture & Threat Model — SIH26091

## Security Directives & Controls

1. **Zero Hardcoded Secrets**:
   - Environment variables loaded exclusively via `pydantic-settings` from `.env`.
   - `.env` strictly ignored by `.gitignore`.

2. **Data & Credential Protection**:
   - Passwords hashed with bcrypt (salted).
   - Sensitive pattern filter applied to logging infrastructure to mask keys, tokens, and passwords in stdout/stderr.

3. **CORS & Network Boundaries**:
   - Strict CORS origins whitelist configured via `CORS_ORIGINS`.
   - No direct database access or internal secrets exposed to the frontend.

4. **Input Validation**:
   - All REST inputs strictly validated via Pydantic models.
   - Zero amount and invalid negative financial numbers rejected.
   - Enforced foreign key business ownership relationships.
