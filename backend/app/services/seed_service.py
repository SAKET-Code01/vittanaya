"""Database Seeding Service for VITTANAYA Reference Libraries & Scheme Rules.

SIH26091 - Deterministic Financial Structuring & Reference Data Loading.
"""

import csv
from pathlib import Path

from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.core.logging import logger
from backend.app.models.insights import ProjectCostReference, SchemeRule
from backend.app.models.location import LocationRef
from backend.app.models.market_data import LocalMarketData
from backend.app.models.user import User

DEFAULT_SCHEME_RULES = [
    {
        "scheme_code": "PMEGP",
        "scheme_name": "Prime Minister's Employment Generation Programme",
        "category": "Credit-Linked Capital Subsidy",
        "max_project_cost_mfg": 5000000.0,
        "max_project_cost_service": 2000000.0,
        "min_margin_pct_gen": 10.0,
        "min_margin_pct_special": 5.0,
        "max_subsidy_pct_rural_gen": 25.0,
        "max_subsidy_pct_rural_special": 35.0,
        "max_subsidy_pct_urban_gen": 15.0,
        "max_subsidy_pct_urban_special": 25.0,
        "max_subsidy_amount": None,
        "interest_subsidy_pct": 0.0,
        "collateral_required": False,
        "eligible_categories": "ALL_EXCEPT_TRADING",
        "trading_restricted": True,
        "source_authority": "KVIC / Ministry of MSME",
        "source_year": "2023-24 Revised Guidelines",
        "official_source_url": (
            "https://www.kviconline.gov.in/pmegpeportal/dashboard/notification/"
            "Revised_PMEGP_Scheme_Guidelines_07122023_compressed.pdf"
        ),
        "notes": "Retail/trading activities restricted or capped. Land cost excluded.",
    },
    {
        "scheme_code": "MUDRA_SHISHU",
        "scheme_name": "Pradhan Mantri MUDRA Yojana - Shishu",
        "category": "Micro Credit",
        "max_project_cost_mfg": 50000.0,
        "max_project_cost_service": 50000.0,
        "min_margin_pct_gen": 0.0,
        "min_margin_pct_special": 0.0,
        "max_subsidy_pct_rural_gen": 0.0,
        "max_subsidy_pct_rural_special": 0.0,
        "max_subsidy_pct_urban_gen": 0.0,
        "max_subsidy_pct_urban_special": 0.0,
        "max_subsidy_amount": 0.0,
        "interest_subsidy_pct": 0.0,
        "collateral_required": False,
        "eligible_categories": "ALL",
        "trading_restricted": False,
        "source_authority": "MUDRA / Department of Financial Services",
        "source_year": "2024",
        "official_source_url": "https://www.mudra.org.in/",
        "notes": "Loans up to Rs. 50,000 for micro-enterprises. No collateral required.",
    },
    {
        "scheme_code": "MUDRA_KISHOR",
        "scheme_name": "Pradhan Mantri MUDRA Yojana - Kishor",
        "category": "Micro Credit",
        "max_project_cost_mfg": 500000.0,
        "max_project_cost_service": 500000.0,
        "min_margin_pct_gen": 10.0,
        "min_margin_pct_special": 5.0,
        "max_subsidy_pct_rural_gen": 0.0,
        "max_subsidy_pct_rural_special": 0.0,
        "max_subsidy_pct_urban_gen": 0.0,
        "max_subsidy_pct_urban_special": 0.0,
        "max_subsidy_amount": 0.0,
        "interest_subsidy_pct": 0.0,
        "collateral_required": False,
        "eligible_categories": "ALL",
        "trading_restricted": False,
        "source_authority": "MUDRA / Department of Financial Services",
        "source_year": "2024",
        "official_source_url": "https://www.mudra.org.in/",
        "notes": "Loans from Rs. 50,000 to Rs. 5 Lakhs for expanding micro-businesses.",
    },
    {
        "scheme_code": "MUDRA_TARUN",
        "scheme_name": "Pradhan Mantri MUDRA Yojana - Tarun",
        "category": "Micro Credit",
        "max_project_cost_mfg": 1000000.0,
        "max_project_cost_service": 1000000.0,
        "min_margin_pct_gen": 10.0,
        "min_margin_pct_special": 5.0,
        "max_subsidy_pct_rural_gen": 0.0,
        "max_subsidy_pct_rural_special": 0.0,
        "max_subsidy_pct_urban_gen": 0.0,
        "max_subsidy_pct_urban_special": 0.0,
        "max_subsidy_amount": 0.0,
        "interest_subsidy_pct": 0.0,
        "collateral_required": False,
        "eligible_categories": "ALL",
        "trading_restricted": False,
        "source_authority": "MUDRA / Department of Financial Services",
        "source_year": "2024",
        "official_source_url": "https://www.mudra.org.in/",
        "notes": "Loans from Rs. 5 Lakhs to Rs. 10 Lakhs for established enterprises.",
    },
    {
        "scheme_code": "PM_FME",
        "scheme_name": "PM Formalisation of Micro food processing Enterprises Scheme",
        "category": "Food Processing Capital Subsidy",
        "max_project_cost_mfg": 2857143.0,
        "max_project_cost_service": 2857143.0,
        "min_margin_pct_gen": 10.0,
        "min_margin_pct_special": 10.0,
        "max_subsidy_pct_rural_gen": 35.0,
        "max_subsidy_pct_rural_special": 35.0,
        "max_subsidy_pct_urban_gen": 35.0,
        "max_subsidy_pct_urban_special": 35.0,
        "max_subsidy_amount": 1000000.0,
        "interest_subsidy_pct": 0.0,
        "collateral_required": False,
        "eligible_categories": (
            "Agro processing, Food processing, Dairy, Horticulture, Composite Fish Culture"
        ),
        "trading_restricted": True,
        "source_authority": "Ministry of Food Processing Industries (MoFPI)",
        "source_year": "2024 Guidelines",
        "official_source_url": "https://pmfme.mofpi.gov.in/",
        "notes": "35% capital subsidy for food processing units up to max Rs. 10 Lakhs.",
    },
    {
        "scheme_code": "PM_VISHWAKARMA",
        "scheme_name": "PM Vishwakarma Scheme",
        "category": "Artisan Enterprise Credit",
        "max_project_cost_mfg": 300000.0,
        "max_project_cost_service": 300000.0,
        "min_margin_pct_gen": 5.0,
        "min_margin_pct_special": 0.0,
        "max_subsidy_pct_rural_gen": 0.0,
        "max_subsidy_pct_rural_special": 0.0,
        "max_subsidy_pct_urban_gen": 0.0,
        "max_subsidy_pct_urban_special": 0.0,
        "max_subsidy_amount": 0.0,
        "interest_subsidy_pct": 8.0,
        "collateral_required": False,
        "eligible_categories": (
            "Artisans, Crafts, Leaf plate making, Woodwork, Bamboo, Leather, Blacksmith, Pottery"
        ),
        "trading_restricted": True,
        "source_authority": "Ministry of Micro, Small & Medium Enterprises (MoMSME)",
        "source_year": "2023-24",
        "official_source_url": "https://pmvishwakarma.gov.in/",
        "notes": "Concessional credit up to Rs. 3 Lakhs with 8% interest subvention.",
    },
    {
        "scheme_code": "STAND_UP_INDIA",
        "scheme_name": "Stand Up India Scheme",
        "category": "SC/ST & Women Enterprise Credit",
        "max_project_cost_mfg": 10000000.0,
        "max_project_cost_service": 10000000.0,
        "min_margin_pct_gen": 15.0,
        "min_margin_pct_special": 15.0,
        "max_subsidy_pct_rural_gen": 0.0,
        "max_subsidy_pct_rural_special": 0.0,
        "max_subsidy_pct_urban_gen": 0.0,
        "max_subsidy_pct_urban_special": 0.0,
        "max_subsidy_amount": 0.0,
        "interest_subsidy_pct": 0.0,
        "collateral_required": True,
        "eligible_categories": "ALL",
        "trading_restricted": False,
        "source_authority": "SIDBI / Department of Financial Services",
        "source_year": "2024",
        "official_source_url": "https://www.standupmitra.in/",
        "notes": "Bank loans between Rs 10 Lakhs and Rs 1 Crore for SC/ST or Women projects.",
    },
]


def seed_project_cost_references(db: Session, csv_path: Path = None) -> int:
    """Seed project_cost_references table from official CSV if empty."""
    existing_count = db.query(ProjectCostReference).count()
    if existing_count > 0:
        logger.info(f"project_cost_references contains {existing_count} records. Skipping.")
        return existing_count

    if csv_path is None:
        fname = "VITTANAYA_ODISHA_200PLUS_PROJECT_COST_LIBRARY.csv"
        possible_paths = [
            settings.BASE_DIR / "data" / "reference" / fname,
            settings.BASE_DIR.parent / "data" / "reference" / fname,
            Path.cwd() / "data" / "reference" / fname,
        ]
        for p in possible_paths:
            if p.exists():
                csv_path = p
                break

    if csv_path is None or not csv_path.exists():
        logger.warning("Project cost CSV not found. Seeding skipped.")
        return 0

    records = []
    with open(csv_path, mode="r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            record = ProjectCostReference(
                business_activity=row["business_activity"].strip(),
                category=row["category"].strip(),
                scale_or_specification=row["scale_or_specification"].strip(),
                unit=row.get("unit", "").strip() if row.get("unit") else None,
                reference_cost_min_inr=float(row["reference_cost_min_inr"]),
                reference_cost_max_inr=float(row["reference_cost_max_inr"]),
                cost_basis=row["cost_basis"].strip(),
                source_authority=row["source_authority"].strip(),
                source_year=row["source_year"].strip(),
                state_or_scope=row["state_or_scope"].strip(),
                source_page=row.get("source_page", "").strip() if row.get("source_page") else None,
                official_source_url=(
                    row.get("official_source_url", "").strip()
                    if row.get("official_source_url")
                    else None
                ),
                notes=row.get("notes", "").strip() if row.get("notes") else None,
                provenance_priority=row["provenance_priority"].strip(),
                use_for_vittanaya=row["use_for_vittanaya"].strip(),
            )
            records.append(record)

    db.bulk_save_objects(records)
    db.commit()
    logger.info(f"Successfully seeded {len(records)} project cost references into database.")
    return len(records)


def seed_scheme_rules(db: Session) -> int:
    """Seed scheme_rules table with official credit scheme rules if empty."""
    existing_count = db.query(SchemeRule).count()
    if existing_count > 0:
        logger.info(f"scheme_rules contains {existing_count} records. Skipping seed.")
        return existing_count

    records = [SchemeRule(**rule_data) for rule_data in DEFAULT_SCHEME_RULES]
    db.bulk_save_objects(records)
    db.commit()
    logger.info(f"Successfully seeded {len(records)} scheme rules into database.")
    return len(records)


def seed_default_user_if_missing(db: Session) -> None:
    """Ensure at least one default rural entrepreneur user exists for profile creation."""
    existing_user = db.query(User).filter(User.id == 1).first()
    if not existing_user:
        user = User(
            id=1,
            name="Entrepreneur",
            email="entrepreneur@vittanaya.in",
            hashed_password="local-demo-password-hash",
            phone="9876543210",
        )
        db.add(user)
        db.commit()
        logger.info("Default rural entrepreneur user seeded.")



DEFAULT_LOCATIONS = [
    {"state_code": "OD", "state_name": "Odisha", "district_name": "Khordha", "block_name": "Jatni", "panchayat_or_village": "Retang", "pincode": "752050", "lgd_code": "3621"},
    {"state_code": "OD", "state_name": "Odisha", "district_name": "Khordha", "block_name": "Bhubaneswar", "panchayat_or_village": "Khurda Town", "pincode": "751001", "lgd_code": "3622"},
    {"state_code": "OD", "state_name": "Odisha", "district_name": "Cuttack", "block_name": "Cuttack Sadar", "panchayat_or_village": "Bidanasi", "pincode": "753014", "lgd_code": "3623"},
    {"state_code": "OD", "state_name": "Odisha", "district_name": "Sundargarh", "block_name": "Rourkela", "panchayat_or_village": "Birmitrapur", "pincode": "770033", "lgd_code": "3624"},
    {"state_code": "OD", "state_name": "Odisha", "district_name": "Puri", "block_name": "Puri Sadar", "panchayat_or_village": "Brahmagiri", "pincode": "752001", "lgd_code": "3625"},
    {"state_code": "OD", "state_name": "Odisha", "district_name": "Ganjam", "block_name": "Berhampur", "panchayat_or_village": "Chhatrapur", "pincode": "760001", "lgd_code": "3626"},
    {"state_code": "OD", "state_name": "Odisha", "district_name": "Sambalpur", "block_name": "Sambalpur Sadar", "panchayat_or_village": "Hirakud", "pincode": "768001", "lgd_code": "3627"},
    {"state_code": "OD", "state_name": "Odisha", "district_name": "Mayurbhanj", "block_name": "Baripada", "panchayat_or_village": "Rairangpur", "pincode": "757001", "lgd_code": "3628"},
    {"state_code": "OD", "state_name": "Odisha", "district_name": "Balasore", "block_name": "Balasore Sadar", "panchayat_or_village": "Remuna", "pincode": "756001", "lgd_code": "3629"},
    {"state_code": "OD", "state_name": "Odisha", "district_name": "Angul", "block_name": "Banarpal", "panchayat_or_village": "Nalco Nagar", "pincode": "759122", "lgd_code": "3630"},
]


def seed_locations(db: Session) -> int:
    """Seed locations table with administrative hierarchy data if empty."""
    existing_count = db.query(LocationRef).count()
    if existing_count > 0:
        logger.info(f"locations contains {existing_count} records. Skipping seed.")
        return existing_count

    records = [LocationRef(**loc) for loc in DEFAULT_LOCATIONS]
    db.bulk_save_objects(records)
    db.commit()
    logger.info(f"Successfully seeded {len(records)} location reference records into database.")
    return len(records)



DEFAULT_MARKET_DATA = [
    {
        "district_name": "Sundargarh",
        "block_name": "Rourkela",
        "sector_category": "poultry",
        "demand_level": "High",
        "competitor_count": 4,
        "avg_price_point": 105.0,
        "unit_of_measure": "₹/kg live bird",
        "market_reach_description": "Rourkela urban + Birmitrapur mining Block catchment high-demand fresh broiler market",
        "opportunity_summary": "Strong protein demand driven by industrial & canteen consumption in Sundargarh block",
        "swot_json": '{"strengths": ["Quick cash turnover", "Established feed suppliers"], "weaknesses": ["Feed price volatility"], "opportunities": ["Institutional hotel supply"], "threats": ["Heat stress in summer"]}',
        "base_score": 78.0,
    },
    {
        "district_name": "Puri",
        "block_name": "Puri Sadar",
        "sector_category": "dairy",
        "demand_level": "High",
        "competitor_count": 3,
        "avg_price_point": 48.0,
        "unit_of_measure": "₹/L milk",
        "market_reach_description": "Puri pilgrim belt & OMFED cooperative collection routes",
        "opportunity_summary": "Guaranteed daily off-take for unadulterated cow milk and sweet stalls",
        "swot_json": '{"strengths": ["Daily liquid cash", "OMFED procurement"], "weaknesses": ["Labor intensive"], "opportunities": ["Paneer & Ghee value addition"], "threats": ["Fodder scarcity"]}',
        "base_score": 88.0,
    },
    {
        "district_name": "Khordha",
        "block_name": "Jatni",
        "sector_category": "agro processing",
        "demand_level": "High",
        "competitor_count": 2,
        "avg_price_point": 140.0,
        "unit_of_measure": "₹/kg processed produce",
        "market_reach_description": "Jatni Mandi + ORMAS retail SHG outlets",
        "opportunity_summary": "High value-addition margin for cashew & spice processing in Khordha",
        "swot_json": '{"strengths": ["35% PM-FME subsidy", "Proximity to raw crops"], "weaknesses": ["Seasonal storage capital"], "opportunities": ["Branded retail packaging"], "threats": ["Weather crop fluctuations"]}',
        "base_score": 86.0,
    },
]


def seed_market_data(db: Session) -> int:
    """Seed local_market_data table with block-level sector benchmarks if empty."""
    existing_count = db.query(LocalMarketData).count()
    if existing_count > 0:
        logger.info(f"local_market_data contains {existing_count} records. Skipping seed.")
        return existing_count

    records = [LocalMarketData(**m) for m in DEFAULT_MARKET_DATA]
    db.bulk_save_objects(records)
    db.commit()
    logger.info(f"Successfully seeded {len(records)} local market data records into database.")
    return len(records)


def seed_all_reference_data(db: Session) -> None:
    """Convenience function to seed all VITTANAYA reference datasets."""
    seed_default_user_if_missing(db)
    seed_project_cost_references(db)
    seed_scheme_rules(db)
    seed_locations(db)
    seed_market_data(db)
