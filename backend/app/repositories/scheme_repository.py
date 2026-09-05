"""Repository for Government Scheme Entity Persistence and Verified Dataset Access.

VITTANAYA Government Scheme Intelligence Layer:
- Verified dataset in JSON format
- DB synchronization with SchemeRule model
- Deterministic access without LLM dependency
"""

import json
from pathlib import Path
from typing import Any, Dict, List, Optional

from sqlalchemy.orm import Session

from backend.app.core.logging import logger
from backend.app.models.insights import SchemeRule

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
SCHEMES_JSON_PATH = DATA_DIR / "government_schemes.json"


class SchemeRepository:
    """Data access operations for government credit & subsidy schemes."""

    def __init__(self, db: Optional[Session] = None):
        self.db = db
        self._cached_schemes: Optional[List[Dict[str, Any]]] = None

    def _load_schemes_from_json(self) -> List[Dict[str, Any]]:
        """Load verified government scheme rules from structured JSON file."""
        if self._cached_schemes is not None:
            return self._cached_schemes

        if not SCHEMES_JSON_PATH.exists():
            logger.warning(f"Schemes JSON dataset not found at {SCHEMES_JSON_PATH}")
            return []

        try:
            with open(SCHEMES_JSON_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                self._cached_schemes = data
                return data
        except Exception as e:
            logger.error(f"Failed to parse schemes JSON: {e}")
            return []

    def get_all_schemes(self) -> List[Dict[str, Any]]:
        """Retrieve all verified government schemes from database or fallback JSON."""
        json_schemes = self._load_schemes_from_json()
        json_map = {s["scheme_code"]: s for s in json_schemes}

        if self.db:
            try:
                db_rules = self.db.query(SchemeRule).all()
                if db_rules:
                    enriched_schemes = []
                    for r in db_rules:
                        meta = json_map.get(r.scheme_code, {})
                        scheme_dict = {
                            "scheme_code": r.scheme_code,
                            "scheme_name": r.scheme_name,
                            "category": r.category,
                            "sector": meta.get("sector", r.category),
                            "eligible_categories": r.eligible_categories,
                            "trading_restricted": r.trading_restricted,
                            "max_project_cost_mfg": max(r.max_project_cost_mfg or 0.0, float(meta.get("max_project_cost_mfg") or 0.0)) or r.max_project_cost_mfg,
                            "max_project_cost_service": max(r.max_project_cost_service or 0.0, float(meta.get("max_project_cost_service") or 0.0)) or r.max_project_cost_service,
                            "min_margin_pct_gen": r.min_margin_pct_gen,
                            "min_margin_pct_special": r.min_margin_pct_special,
                            "max_subsidy_pct_rural_gen": r.max_subsidy_pct_rural_gen,
                            "max_subsidy_pct_rural_special": r.max_subsidy_pct_rural_special,
                            "max_subsidy_pct_urban_gen": r.max_subsidy_pct_urban_gen,
                            "max_subsidy_pct_urban_special": r.max_subsidy_pct_urban_special,
                            "max_subsidy_amount": r.max_subsidy_amount,
                            "interest_subsidy_pct": r.interest_subsidy_pct,
                            "collateral_required": r.collateral_required,
                            "subsidy_loan_type": meta.get("subsidy_loan_type", r.category),
                            "benefit": meta.get("benefit", f"Assistance under {r.scheme_name}"),
                            "required_documents": meta.get("required_documents", [
                                "Aadhaar Card & PAN Card",
                                "Detailed Project Report (DPR)",
                                "Udyam Registration Certificate",
                                "Bank Account Statements (6-12 Months)"
                            ]),
                            "official_source": r.source_authority,
                            "source_authority": r.source_authority,
                            "source_year": r.source_year,
                            "official_source_url": r.official_source_url or meta.get("official_source_url"),
                            "notes": r.notes or meta.get("notes"),
                        }
                        enriched_schemes.append(scheme_dict)

                    # If some schemes in JSON are not in DB (e.g. CGTMSE, AIF, MSME), include them
                    existing_codes = {s["scheme_code"] for s in enriched_schemes}
                    for code, js in json_map.items():
                        if code not in existing_codes:
                            enriched_schemes.append(js)

                    return enriched_schemes
            except Exception as e:
                logger.warning(f"Error reading schemes from DB, using verified JSON: {e}")

        return json_schemes

    def get_by_code(self, scheme_code: str) -> Optional[Dict[str, Any]]:
        """Retrieve a specific scheme by its code."""
        schemes = self.get_all_schemes()
        for s in schemes:
            if s["scheme_code"].upper() == scheme_code.upper():
                return s
        return None

    def seed_db_if_needed(self) -> int:
        """Synchronize JSON dataset into database scheme_rules table."""
        if not self.db:
            return 0

        json_schemes = self._load_schemes_from_json()
        if not json_schemes:
            return 0

        added = 0
        try:
            existing_codes = {r.scheme_code for r in self.db.query(SchemeRule.scheme_code).all()}
            for s in json_schemes:
                if s["scheme_code"] not in existing_codes:
                    rule = SchemeRule(
                        scheme_code=s["scheme_code"],
                        scheme_name=s["scheme_name"],
                        category=s["category"],
                        max_project_cost_mfg=s.get("max_project_cost_mfg"),
                        max_project_cost_service=s.get("max_project_cost_service"),
                        min_margin_pct_gen=s.get("min_margin_pct_gen", 10.0),
                        min_margin_pct_special=s.get("min_margin_pct_special", 5.0),
                        max_subsidy_pct_rural_gen=s.get("max_subsidy_pct_rural_gen", 25.0),
                        max_subsidy_pct_rural_special=s.get("max_subsidy_pct_rural_special", 35.0),
                        max_subsidy_pct_urban_gen=s.get("max_subsidy_pct_urban_gen", 15.0),
                        max_subsidy_pct_urban_special=s.get("max_subsidy_pct_urban_special", 25.0),
                        max_subsidy_amount=s.get("max_subsidy_amount"),
                        interest_subsidy_pct=s.get("interest_subsidy_pct", 0.0),
                        collateral_required=s.get("collateral_required", False),
                        eligible_categories=s.get("eligible_categories", "ALL"),
                        trading_restricted=s.get("trading_restricted", False),
                        source_authority=s.get("source_authority", "Official Scheme Authority"),
                        source_year=s.get("source_year", "2024"),
                        official_source_url=s.get("official_source_url"),
                        notes=s.get("notes"),
                    )
                    self.db.add(rule)
                    added += 1
            if added > 0:
                self.db.commit()
                logger.info(f"Seeded {added} new scheme rules into database.")
        except Exception as e:
            self.db.rollback()
            logger.warning(f"Scheme database seeding warning: {e}")

        return added
