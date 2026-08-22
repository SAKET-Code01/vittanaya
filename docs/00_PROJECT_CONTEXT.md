# 00. Project Context — Vittanaya (SIH26091)

## Executive Summary
**Vittanaya** is an AI-driven hyper-local business advisory and financial structuring assistant built specifically for **rural micro-entrepreneurs**, aligned with **Smart India Hackathon 2026 Problem SIH26091** under the **Ministry of Social Justice and Empowerment (MoSJE)**.

The system empowers rural artisans, nano-enterprises, village craft collectives, and micro-business owners by translating complex financial transactions into clear working-capital runways, liquidity risk assessments, and targeted financial structuring roadmaps.

> [!NOTE]
> **Historical Origin**: Vittanaya originally began as an MSME cash-flow decision support prototype for SOA IDEATHON Problem S42. The project has been formally pivoted to address SIH26091, with the core financial engine serving as the foundation for hyper-local rural business intelligence. S42 documentation is archived under `docs/archive/s42/`.

---

## SIH26091 Alignment Overview
- **Problem ID**: SIH26091
- **Title**: AI-Driven Hyper-Local Business Advisory and Financial Structuring Assistant for Rural Micro-Entrepreneurs
- **Organization**: Ministry of Social Justice and Empowerment (MoSJE)
- **Target Beneficiaries**: Rural artisans, handloom weavers, pottery workers, small agri-processors, village retail nano-units, and SHG-led micro-enterprises.

---

## Architectural Principles
1. **Preserve Prototype Strengths**: The rich React+Tailwind visual shell is preserved and integrated via a robust service boundary.
2. **Deterministic Financial Math**: Financial metrics (cashflow, liquidity runway, funding gaps) use strict Decimal arithmetic in backend Python engines.
3. **Local-First & Scalable**: SQLite database and local FastAPI service for Phase 1 with zero external cloud dependencies for demo reliability.
4. **Structured API Boundaries**: Clean RESTful architecture connecting React frontend to FastAPI backend.
