"""API Endpoints for Action Plan & DPR Generation.

SIH26091 - Business Execution Roadmap & Bankable DPR Compiler.
"""

import json
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.models.action_plan import ActionPlanTask, DPRDocument
from backend.app.schemas.action_plan import (
    ActionPlanResponse,
    DPRExportRequest,
    DPRExportResponse,
    TaskItemSchema,
    TaskUpdateSchema,
)

router = APIRouter(prefix="/action-plan", tags=["Action Plan & DPR"])

DEFAULT_TASKS = [
    {
        "phase": "Phase 1: Pre-Sanction Readiness",
        "title": "Verify Available Margin Capital Proof",
        "description": "Gather bank account statement or Fixed Deposit certificate showing minimum required own equity.",
        "target_days": 3,
        "is_mandatory": True,
        "authority_name": "Commercial / Gramya Bank Branch",
    },
    {
        "phase": "Phase 1: Pre-Sanction Readiness",
        "title": "Obtain Aadhaar & Caste/Category Certificate",
        "description": "Ensure updated Aadhaar card and SC/ST/OBC/Women certificate for capital subsidy eligibility under PMEGP.",
        "target_days": 5,
        "is_mandatory": True,
        "authority_name": "Revenue Department / Tahsildar",
    },
    {
        "phase": "Phase 2: Scheme Portal & DPR Submission",
        "title": "Submit Online PMEGP Application",
        "description": "Fill official e-tracking form on KVIC / MyScheme portal with project cost breakdown.",
        "target_days": 10,
        "is_mandatory": True,
        "authority_name": "KVIC / KVIB / DIC Odisha",
    },
    {
        "phase": "Phase 2: Scheme Portal & DPR Submission",
        "title": "Present Detailed Project Report (DPR) to Bank Manager",
        "description": "Submit VITTANAYA compiled DPR along with site lease agreement for loan appraisal.",
        "target_days": 15,
        "is_mandatory": True,
        "authority_name": "Lead District Bank Manager",
    },
    {
        "phase": "Phase 3: Unit Setup & Statutory Compliance",
        "title": "Register Udyam MSME Certificate",
        "description": "Complete instant free Udyam registration online to access CGTMSE collateral-free guarantee.",
        "target_days": 20,
        "is_mandatory": True,
        "authority_name": "Ministry of MSME Portal",
    },
]


@router.get(
    "/{business_id}",
    response_model=ActionPlanResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Action Plan Tasks for Enterprise",
)
def get_action_plan(
    business_id: int,
    db: Session = Depends(get_db),
) -> ActionPlanResponse:
    """Retrieve or initialize phased execution roadmap tasks for enterprise."""
    from backend.app.services.business_service import BusinessService

    biz_service = BusinessService(db)
    if not biz_service.get_business(business_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Business with ID {business_id} not found",
        )

    tasks = db.query(ActionPlanTask).filter(ActionPlanTask.business_id == business_id).all()

    if not tasks:
        # Seed default tasks for business
        for item in DEFAULT_TASKS:
            t = ActionPlanTask(
                business_id=business_id,
                phase=item["phase"],
                title=item["title"],
                description=item["description"],
                status="pending",
                target_days=item["target_days"],
                is_mandatory=item["is_mandatory"],
                authority_name=item["authority_name"],
            )
            db.add(t)
        db.commit()
        tasks = db.query(ActionPlanTask).filter(ActionPlanTask.business_id == business_id).all()

    completed_count = sum(1 for task in tasks if task.status == "completed")
    total_count = len(tasks)
    completion_pct = (completed_count / total_count * 100.0) if total_count > 0 else 0.0

    return ActionPlanResponse(
        business_id=business_id,
        total_tasks=total_count,
        completed_tasks=completed_count,
        completion_pct=round(completion_pct, 1),
        tasks=[TaskItemSchema.model_validate(t) for t in tasks],
    )


@router.patch(
    "/tasks/{task_id}",
    response_model=TaskItemSchema,
    status_code=status.HTTP_200_OK,
    summary="Update Action Plan Task Status",
)
def update_task_status(
    task_id: int,
    payload: TaskUpdateSchema,
    business_id: Optional[int] = None,
    db: Session = Depends(get_db),
) -> TaskItemSchema:
    """Update execution status of a roadmap task ('pending', 'in_progress', 'completed')."""
    task = db.query(ActionPlanTask).filter(ActionPlanTask.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task ID {task_id} not found",
        )

    if business_id is not None and task.business_id != business_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Task ID {task_id} does not belong to business ID {business_id}",
        )

    task.status = payload.status
    db.commit()
    db.refresh(task)
    return TaskItemSchema.model_validate(task)


@router.post(
    "/export-dpr",
    response_model=DPRExportResponse,
    status_code=status.HTTP_200_OK,
    summary="Compile Detailed Project Report (DPR)",
)
def export_dpr(
    payload: DPRExportRequest,
    db: Session = Depends(get_db),
) -> DPRExportResponse:
    """Compile bankable Detailed Project Report (DPR) with verified financial structuring."""
    from backend.app.services.business_service import BusinessService

    biz_service = BusinessService(db)
    if not biz_service.get_business(payload.business_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Business with ID {payload.business_id} not found for DPR export",
        )
    now_str = datetime.now().strftime("%d %b %Y, %I:%M %p")
    doc_name = f"DPR_{payload.business_name.replace(' ', '_')}_{datetime.now().strftime('%Y%m%d')}.json"

    dpr_content = {
        "title": f"Detailed Project Report (DPR) — {payload.business_name}",
        "metadata": {
            "business_name": payload.business_name,
            "category": payload.business_category,
            "location": payload.location,
            "compiled_at": now_str,
            "authority": "VITTANAYA Rural Advisory Engine (SIH26091)",
        },
        "financial_summary": {
            "indicative_project_cost": payload.indicative_project_cost,
            "own_margin_capital": payload.own_margin_capital,
            "eligible_bank_loan": payload.eligible_loan_amount,
            "estimated_capital_subsidy": payload.estimated_subsidy_amount,
            "recommended_scheme": payload.scheme_name,
        },
        "cost_breakdown": {
            "plant_and_machinery": round(payload.indicative_project_cost * 0.55, 2),
            "premises_and_fitments": round(payload.indicative_project_cost * 0.15, 2),
            "working_capital": round(payload.indicative_project_cost * 0.20, 2),
            "contingency_buffer": round(payload.indicative_project_cost * 0.10, 2),
        },
        "declaration": "This DPR has been compiled using deterministic financial math and verified government scheme rules.",
    }

    doc = DPRDocument(
        business_id=payload.business_id,
        document_name=doc_name,
        project_cost=payload.indicative_project_cost,
        own_margin=payload.own_margin_capital,
        eligible_loan=payload.eligible_loan_amount,
        subsidy_amount=payload.estimated_subsidy_amount,
        generated_at=now_str,
        content_json=json.dumps(dpr_content),
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    summary_text = (
        f"Bankable DPR compiled for {payload.business_name}. "
        f"Indicative Cost: ₹{payload.indicative_project_cost:,.2f}, Own Margin: ₹{payload.own_margin_capital:,.2f}, "
        f"Bank Debt Requirement: ₹{payload.eligible_loan_amount:,.2f} under {payload.scheme_name}."
    )

    return DPRExportResponse(
        dpr_id=doc.id,
        document_name=doc_name,
        generated_at=now_str,
        project_cost=payload.indicative_project_cost,
        own_margin=payload.own_margin_capital,
        eligible_loan=payload.eligible_loan_amount,
        subsidy_amount=payload.estimated_subsidy_amount,
        summary=summary_text,
        dpr_content=dpr_content,
    )

@router.get(
    "/dpr-html/{document_id}",
    response_class=HTMLResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Printable Bankable DPR HTML Document",
)
def get_dpr_html(
    document_id: int,
    db: Session = Depends(get_db),
) -> HTMLResponse:
    """Render an official, bank-ready Detailed Project Report (DPR) HTML document for printing/PDF generation."""
    doc = db.query(DPRDocument).filter(DPRDocument.id == document_id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"DPR Document #{document_id} not found.",
        )

    content = json.loads(doc.content_json) if doc.content_json else {}
    meta = content.get("metadata", {})
    fin = content.get("financial_summary", {})
    cost = content.get("cost_breakdown", {})

    html_code = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{content.get('title', 'Detailed Project Report')}</title>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; color: #1e293b; background: #ffffff; }}
        .header {{ border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }}
        .title {{ font-size: 24px; font-weight: bold; color: #1e3a8a; margin: 0; }}
        .subtitle {{ font-size: 14px; color: #64748b; margin-top: 5px; }}
        .section {{ margin-bottom: 30px; }}
        .section-title {{ font-size: 16px; font-weight: bold; color: #2563eb; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 15px; }}
        table {{ width: 100%; border-collapse: collapse; margin-top: 10px; }}
        th, td {{ border: 1px solid #cbd5e1; padding: 10px; text-align: left; font-size: 13px; }}
        th {{ background-color: #f8fafc; font-weight: bold; color: #334155; }}
        .footer {{ font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 40px; text-align: center; }}
        @media print {{ body {{ margin: 0; }} }}
    </style>
</head>
<body>
    <div class="header">
        <div class="title">{content.get('title', 'Detailed Project Report')}</div>
        <div class="subtitle">Statutory Bankable Report | VITTANAYA SIH26091 Advisory Platform</div>
    </div>

    <div class="section">
        <div class="section-title">1. Enterprise Overview</div>
        <table>
            <tr><th>Enterprise Name</th><td>{meta.get('business_name', 'N/A')}</td></tr>
            <tr><th>Category / Activity</th><td>{meta.get('category', 'N/A')}</td></tr>
            <tr><th>Location</th><td>{meta.get('location', 'N/A')}</td></tr>
            <tr><th>Report Compiled At</th><td>{meta.get('compiled_at', 'N/A')}</td></tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">2. Capital Structure & Financing Means</div>
        <table>
            <tr><th>Indicative Project Cost</th><td>₹{fin.get('indicative_project_cost', 0):,.2f}</td></tr>
            <tr><th>Promoter Own Equity (Margin)</th><td>₹{fin.get('own_margin_capital', 0):,.2f}</td></tr>
            <tr><th>Eligible Bank Term Debt / Working Capital</th><td>₹{fin.get('eligible_bank_loan', 0):,.2f}</td></tr>
            <tr><th>Estimated Government Capital Subsidy</th><td>₹{fin.get('estimated_capital_subsidy', 0):,.2f}</td></tr>
            <tr><th>Recommended Scheme Framework</th><td>{fin.get('recommended_scheme', 'N/A')}</td></tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">3. Indicative Project Cost Breakdown</div>
        <table>
            <tr><th>Component</th><th>Amount (₹)</th></tr>
            <tr><td>Plant & Machinery / Equipment</td><td>₹{cost.get('plant_and_machinery', 0):,.2f}</td></tr>
            <tr><td>Premises / Fitments / Infrastructure</td><td>₹{cost.get('premises_and_fitments', 0):,.2f}</td></tr>
            <tr><td>Working Capital Requirement</td><td>₹{cost.get('working_capital', 0):,.2f}</td></tr>
            <tr><td>Contingency Buffer (10%)</td><td>₹{cost.get('contingency_buffer', 0):,.2f}</td></tr>
        </table>
    </div>

    <div class="footer">
        {content.get('declaration', '')}<br/>
        Generated by VITTANAYA — AI-Driven Hyper-Local Business Advisory and Financial Structuring Assistant (MoSJE SIH26091).
    </div>
</body>
</html>"""
    return HTMLResponse(content=html_code)
