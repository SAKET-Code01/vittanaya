"""Business-Specific Requirement Resolver Service.

SIH26091 - Dynamic Requirement Resolution for Rural Micro-Enterprises.
Tailors statutory, capital, document, licensing, and infrastructure checklists
based on business sector, stage, location, and operational parameters.
"""

from decimal import Decimal
from typing import Dict, List

from sqlalchemy.orm import Session

from backend.app.models.business import Business
from backend.app.models.business_requirement import BusinessRequirement


class RequirementResolverService:
    """Resolves and synchronizes tailored readiness requirements for a business profile."""

    def __init__(self, db: Session):
        self.db = db

    def resolve_requirements(self, business: Business) -> List[BusinessRequirement]:
        """Resolve full tailored requirement set based on business context, preserving existing DB states."""
        # 1. Fetch existing saved requirements
        existing_map: Dict[str, BusinessRequirement] = {
            r.requirement_id: r
            for r in self.db.query(BusinessRequirement)
            .filter(BusinessRequirement.business_id == business.id)
            .all()
        }

        # 2. Extract context attributes
        cat_lower = (business.category or business.type or business.industry or "").lower()
        ind_lower = (business.industry or "").lower()
        stage = (business.stage or "established").lower()
        area_type = (business.area_type or "Rural").lower()
        ops = (business.selected_operations or "").lower()
        own_cap = Decimal(str(business.own_capital or "0.00"))
        proj_cost = Decimal(str(business.project_cost or "0.00"))

        # Required 10% margin check
        min_margin = proj_cost * Decimal("0.10") if proj_cost > Decimal("0.00") else Decimal("50000.00")
        has_adequate_margin = own_cap >= min_margin and own_cap > Decimal("0.00")

        # Determine sector types
        is_food_agri = any(
            k in cat_lower or k in ind_lower
            for k in [
                "food",
                "restaurant",
                "processing",
                "dairy",
                "poultry",
                "bakery",
                "canteen",
                "catering",
                "spices",
                "pickle",
            ]
        )
        is_poultry_livestock = any(
            k in cat_lower or k in ind_lower
            for k in ["poultry", "dairy", "livestock", "fisheries", "goat", "broiler"]
        )
        is_retail_trading = any(
            k in cat_lower or k in ind_lower
            for k in ["retail", "trade", "shop", "store", "wholesale", "dealer", "kirana"]
        )
        is_manufacturing = any(
            k in cat_lower or k in ind_lower
            for k in [
                "manufacturing",
                "production",
                "fabrication",
                "mill",
                "textile",
                "plastic",
                "metal",
                "machining",
            ]
        )
        is_handicrafts = any(
            k in cat_lower or k in ind_lower
            for k in ["handicraft", "artisan", "handloom", "weaving", "pottery", "coir", "terracotta"]
        )
        is_services = any(
            k in cat_lower or k in ind_lower
            for k in ["service", "it", "consulting", "repair", "hospitality", "salon"]
        )
        is_fleet = any(
            k in cat_lower or k in ind_lower or k in ops
            for k in ["transport", "fleet", "logistics", "auto", "vehicle"]
        )

        template_items: List[Dict[str, any]] = []

        # =========================================================================
        # 1. CAPITAL AVAILABILITY
        # =========================================================================
        cap_status = "completed" if has_adequate_margin else ("in_progress" if own_cap > Decimal("0.00") else "pending")
        template_items.append({
            "requirement_id": "req_capital",
            "name": "Minimum Promoter Margin Capital",
            "category": "Capital",
            "required": True,
            "default_status": cap_status,
            "reason": (
                f"Available margin capital of ₹{own_cap:,.2f} evaluated against minimum institutional equity "
                f"requirement of ₹{min_margin:,.2f} (10% standard project cost coverage)."
            ),
            "source": "Reserve Bank of India (RBI) Priority Sector Lending & NABARD PLP Guidelines",
            "document_type": "Bank Passbook / Fixed Deposit Statement",
            "submission_status": "submitted" if own_cap > 0 else "pending",
            "verification_status": "verified" if has_adequate_margin else "unverified",
        })

        # =========================================================================
        # 2. BUSINESS REGISTRATION (Udyam MSME)
        # =========================================================================
        has_udyam = bool(business.udyam_registration and business.udyam_registration.strip())
        template_items.append({
            "requirement_id": "req_udyam",
            "name": "Udyam MSME Registration Certificate",
            "category": "Registration",
            "required": True,
            "default_status": "completed" if has_udyam else "pending",
            "reason": (
                "Statutory Udyam registration is required for CGTMSE collateral-free bank loans "
                "and interest subventions under Ministry of MSME guidelines."
            ),
            "source": "Ministry of Micro, Small and Medium Enterprises (udyamregistration.gov.in)",
            "document_type": "Udyam Registration Certificate",
            "submission_status": "submitted" if has_udyam else "pending",
            "verification_status": "verified" if has_udyam else "unverified",
        })

        # =========================================================================
        # 3. IDENTITY & STATUTORY KYC DOCUMENTS
        # =========================================================================
        has_pan = bool(business.pan and business.pan.strip())
        template_items.append({
            "requirement_id": "req_kyc_pan_aadhaar",
            "name": "Promoter Identity & Business PAN / Aadhaar KYC",
            "category": "Document",
            "required": True,
            "default_status": "completed" if has_pan else "pending",
            "reason": "Mandatory identity and tax KYC verification required for enterprise bank account and loan processing.",
            "source": "Reserve Bank of India (RBI) Master Direction - Know Your Customer (KYC)",
            "document_type": "PAN Card & Aadhaar Card",
            "submission_status": "submitted" if has_pan else "pending",
            "verification_status": "verified" if has_pan else "unverified",
        })

        # =========================================================================
        # 4. GST REGISTRATION (Where Applicable)
        # =========================================================================
        has_gst = bool(business.gstin and business.gstin.strip())
        # Not mandatory for very early stage or small village businesses unless trading interstate
        is_gst_mandatory = is_retail_trading or is_manufacturing or (proj_cost > Decimal("2000000.00"))
        template_items.append({
            "requirement_id": "req_gst",
            "name": "GSTIN Registration / Exemption Declaration",
            "category": "Registration",
            "required": is_gst_mandatory,
            "default_status": "completed" if has_gst else ("pending" if is_gst_mandatory else "not_applicable"),
            "reason": (
                "GST registration mandatory for inter-state trading or turnover above threshold limits (₹20L/₹40L)."
                if is_gst_mandatory
                else "Optional/exempt for micro-enterprises under statutory turnover threshold."
            ),
            "source": "Central Board of Indirect Taxes and Customs (CBIC)",
            "document_type": "GST Certificate / Exemption Affidavit",
            "submission_status": "submitted" if has_gst else "pending",
            "verification_status": "verified" if has_gst else "unverified",
        })

        # =========================================================================
        # 5. LOCAL PERMISSION / GRAM PANCHAYAT NOC
        # =========================================================================
        is_rural = "rural" in area_type
        template_items.append({
            "requirement_id": "req_local_noc",
            "name": "Gram Panchayat No-Objection Certificate (NOC)" if is_rural else "Municipal Trade Clearance",
            "category": "Permission",
            "required": True,
            "default_status": "pending",
            "reason": (
                f"Local government clearance required from {'Gram Panchayat' if is_rural else 'Urban Local Body'} "
                f"for operating commercial site in {business.location_district or 'district'}."
            ),
            "source": "Odisha Panchayati Raj & Drinking Water Department",
            "document_type": "Gram Panchayat / Municipal Trade NOC",
            "submission_status": "pending",
            "verification_status": "unverified",
        })

        # =========================================================================
        # 6. SECTOR-SPECIFIC LICENSES & PERMISSIONS
        # =========================================================================
        if is_food_agri:
            template_items.append({
                "requirement_id": "req_fssai",
                "name": "FSSAI Food Safety Registration / License",
                "category": "License",
                "required": True,
                "default_status": "pending",
                "reason": (
                    f"Mandatory food safety clearance under Section 31 of FSS Act 2006 for {business.category or 'food processing'} "
                    "units before commercial operations."
                ),
                "source": "Food Safety and Standards Authority of India (FSSAI)",
                "document_type": "FSSAI License / Registration Certificate",
                "submission_status": "pending",
                "verification_status": "unverified",
            })

        if is_poultry_livestock or is_manufacturing:
            template_items.append({
                "requirement_id": "req_spcb_consent",
                "name": "Pollution Control Board Consent (OSPCB White/Green Category)",
                "category": "Permission",
                "required": True,
                "default_status": "pending",
                "reason": (
                    "State Pollution Control Board environmental categorization and biosecurity/effluent "
                    "discharge clearance for processing and livestock units."
                ),
                "source": "Odisha State Pollution Control Board (OSPCB)",
                "document_type": "Consent to Establish (CTE) / Exemption Undertaking",
                "submission_status": "pending",
                "verification_status": "unverified",
            })

        if is_retail_trading:
            template_items.append({
                "requirement_id": "req_trade_license",
                "name": "Shop & Commercial Establishment Trade License",
                "category": "License",
                "required": True,
                "default_status": "pending",
                "reason": "Statutory operating license issued under Odisha Shops & Commercial Establishments Act for retail premises.",
                "source": "Odisha Directorate of Factories & Boilers / Local Municipality",
                "document_type": "Trade License Certificate",
                "submission_status": "pending",
                "verification_status": "unverified",
            })

        if is_handicrafts:
            template_items.append({
                "requirement_id": "req_artisan_pehchan",
                "name": "Pehchan Artisan ID Card / Handloom Board Registration",
                "category": "Registration",
                "required": True,
                "default_status": "pending",
                "reason": "Official Artisan ID enabling PM Vishwakarma and Mudra concessional micro-credit eligibility.",
                "source": "Development Commissioner (Handicrafts), Ministry of Textiles",
                "document_type": "Pehchan Card / Weaver Registration",
                "submission_status": "pending",
                "verification_status": "unverified",
            })

        if is_services:
            template_items.append({
                "requirement_id": "req_professional_tax",
                "name": "Professional Tax Enrollment (P-Tax)",
                "category": "Registration",
                "required": True,
                "default_status": "pending",
                "reason": "Commercial service establishment tax enrollment required under Odisha State Tax rules.",
                "source": "Government of Odisha Commercial Tax Department",
                "document_type": "P-Tax Certificate",
                "submission_status": "pending",
                "verification_status": "unverified",
            })

        if is_fleet:
            template_items.append({
                "requirement_id": "req_fleet_permit",
                "name": "Commercial Transport Permits & Fleet Fitness",
                "category": "Permission",
                "required": True,
                "default_status": "pending",
                "reason": "RTO commercial transport permit and road fitness documentation for operational vehicles.",
                "source": "Odisha State Transport Authority (STA)",
                "document_type": "Commercial Vehicle Permits",
                "submission_status": "pending",
                "verification_status": "unverified",
            })

        # =========================================================================
        # 7. INFRASTRUCTURE READINESS
        # =========================================================================
        has_address = bool(business.registered_address and business.registered_address.strip())
        template_items.append({
            "requirement_id": "req_infra_premises",
            "name": "Operational Premises Tenancy or RoR Proof",
            "category": "Infrastructure",
            "required": True,
            "default_status": "completed" if has_address else "pending",
            "reason": (
                "Verified site possession proof (Registered Rent Agreement or Land Record of Rights) "
                "confirming commercial operational rights."
            ),
            "source": "State Revenue Department & Lead Bank Lending Standards",
            "document_type": "Registered Lease Agreement / RoR Khatian",
            "submission_status": "submitted" if has_address else "pending",
            "verification_status": "verified" if has_address else "unverified",
        })

        template_items.append({
            "requirement_id": "req_infra_utilities",
            "name": "Commercial Power & Water Connection Setup",
            "category": "Infrastructure",
            "required": True,
            "default_status": "pending",
            "reason": "Electricity utility sanctioned commercial load and continuous water access for operations.",
            "source": "Odisha Electricity Regulatory Commission (OERC) & Local Discom",
            "document_type": "Electricity Sanction Letter / Utility Receipt",
            "submission_status": "pending",
            "verification_status": "unverified",
        })

        if is_manufacturing or is_poultry_livestock or is_food_agri:
            template_items.append({
                "requirement_id": "req_infra_equipment",
                "name": "Machinery & Equipment Procurement Readiness",
                "category": "Infrastructure",
                "required": True,
                "default_status": "pending",
                "reason": "Supplier quotations and machinery fitment layout ready for bank DPR appraisal.",
                "source": "NABARD Sector Unit Cost Profiles",
                "document_type": "Equipment Proforma Invoice / Quotations",
                "submission_status": "pending",
                "verification_status": "unverified",
            })

        # =========================================================================
        # 8. OPERATIONS & WORKFORCE
        # =========================================================================
        total_emp = business.total_employees
        payroll_amt = Decimal(str(business.payroll_amount or "0.00"))
        has_workforce_setup = total_emp > 0 or payroll_amt > Decimal("0.00")
        template_items.append({
            "requirement_id": "req_ops_workforce",
            "name": "Workforce & Operational Payroll Setup",
            "category": "Operations",
            "required": stage != "new_idea",
            "default_status": "completed" if has_workforce_setup else ("pending" if stage != "new_idea" else "not_applicable"),
            "reason": (
                f"Workforce structure: {business.full_time_employees} full-time, {business.contractual_employees} contractual "
                f"staff with monthly wage disbursement baseline of ₹{payroll_amt:,.2f}."
                if has_workforce_setup
                else "Workforce and operational payroll schedule setup for business continuity."
            ),
            "source": "Odisha Labor Commissioner & Minimum Wages Schedule",
            "document_type": "Staff Muster Roll / Wage Agreement",
            "submission_status": "submitted" if has_workforce_setup else "pending",
            "verification_status": "verified" if has_workforce_setup else "unverified",
        })

        # 3. Synchronize with Database
        resolved_results: List[BusinessRequirement] = []
        for item in template_items:
            req_id = item["requirement_id"]
            if req_id in existing_map:
                # Update metadata while preserving user-marked status if already modified
                existing = existing_map[req_id]
                existing.name = item["name"]
                existing.category = item["category"]
                existing.required = item["required"]
                existing.reason = item["reason"]
                existing.source = item["source"]
                if existing.status == "pending" and item["default_status"] in ["completed", "verified"]:
                    existing.status = item["default_status"]
                    existing.verification_status = item.get("verification_status", "verified")
                resolved_results.append(existing)
            else:
                # Insert new tailored requirement
                new_req = BusinessRequirement(
                    business_id=business.id,
                    requirement_id=req_id,
                    name=item["name"],
                    category=item["category"],
                    required=item["required"],
                    status=item["default_status"],
                    reason=item["reason"],
                    source=item["source"],
                    document_type=item.get("document_type"),
                    submission_status=item.get("submission_status", "pending"),
                    verification_status=item.get("verification_status", "unverified"),
                )
                self.db.add(new_req)
                resolved_results.append(new_req)

        self.db.commit()
        return resolved_results
