# Vittanaya

**AI-Driven Hyper-Local Business Advisory and Financial Structuring Assistant for Rural Micro-Entrepreneurs**  
**Smart India Hackathon (SIH 2026) Problem SIH26091** — Ministry of Social Justice and Empowerment (MoSJE)

## Overview
Vittanaya provides rural micro-entrepreneurs, artisans, and nano-enterprises with automated cash-flow forecasting, liquidity risk assessments, working-capital structuring, and business advisory foundations.

## Core Capabilities
- **Cash-Flow Ledger & Timeseries Calculations**: Inflow/outflow tracking with deterministic Decimal calculations.
- **Operational Runway & Liquidity Risk**: Accurate calculation of operational days remaining and risk categorization.
- **Financial Structuring & Gap Analysis**: Determining working-capital shortfalls against enterprise targets.
- **Enterprise Profile & Hyper-Local Context**: Village and district-level operational parameters.

## Repository Structure
```text
vittanaya/
├── frontend/       # React 18 + Vite Single Page Application
├── backend/        # Python + FastAPI REST API v1 (SQLAlchemy + SQLite)
├── data/           # Raw, processed, synthetic, and reference data
├── docs/           # System specifications & SIH26091 architecture
├── scripts/        # Seeding and utility scripts
└── tests/          # Pytest automated test suite
```

## Running the Project
### Backend API
```bash
# Install dependencies
pip install -r backend/requirements.txt

# Run database seed
python scripts/seed_demo_data.py

# Start FastAPI server
uvicorn backend.main:app --reload --port 8000
```
API Documentation will be accessible at `http://localhost:8000/docs`.

### Frontend Application
```bash
cd frontend
npm install
npm run dev
```
Web application accessible at `http://localhost:3000/`.
