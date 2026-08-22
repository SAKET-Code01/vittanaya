"""Deterministic seed script generating demo data for a sample rural micro-entrepreneur.

SIH26091 — AI-Driven Hyper-Local Business Advisory and Financial Structuring Assistant
Target Profile: Rural Handicraft & Handloom Workshop (Sundargram, Puri, Odisha)
"""

import sys
from datetime import date, timedelta
from decimal import Decimal
from pathlib import Path

# Ensure repository root is on sys.path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from backend.app.core.database import Base, SessionLocal, engine  # noqa: E402
from backend.app.core.security import get_password_hash  # noqa: E402
from backend.app.models.business import Business  # noqa: E402
from backend.app.models.expense import Expense  # noqa: E402
from backend.app.models.goal import BusinessGoal  # noqa: E402
from backend.app.models.payable import Payable  # noqa: E402
from backend.app.models.receivable import Receivable  # noqa: E402
from backend.app.models.transaction import Transaction  # noqa: E402
from backend.app.models.user import User  # noqa: E402


def seed_data() -> None:
    """Execute deterministic database seeding."""
    print("Creating database schema...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Check if already seeded
        existing_user = db.query(User).filter(User.email == "lakshmi@sundargram.in").first()
        if existing_user:
            print("Demo data already seeded. Skipping.")
            return

        print("Seeding demo rural micro-entrepreneur user...")
        user = User(
            name="Lakshmi Devi",
            email="lakshmi@sundargram.in",
            hashed_password=get_password_hash("DemoRuralPass2026!"),
            phone="+91 98765 43210",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        print("Seeding rural micro-enterprise business profile...")
        business = Business(
            owner_id=user.id,
            name="Lakshmi Terracotta & Handloom Crafts",
            type="Handicraft & Artisan",
            industry="Artisanal Manufacturing",
            location_village="Sundargram",
            location_district="Puri",
            location_state="Odisha",
            location_pin="752001",
            phone="+91 98765 43210",
            email="lakshmi@sundargram.in",
            description=(
                "Village-based women artisan collective producing eco-friendly "
                "terracotta pottery and traditional handloom fabrics."
            ),
            monthly_revenue_estimate=Decimal("65000.00"),
            monthly_expense_estimate=Decimal("38000.00"),
        )
        db.add(business)
        db.commit()
        db.refresh(business)

        today = date.today()

        print("Seeding sample historical transactions...")
        transactions = [
            Transaction(
                business_id=business.id,
                transaction_date=today - timedelta(days=28),
                amount=Decimal("32000.00"),
                category="sales",
                description="Bhubaneswar State Handloom Expo sales",
            ),
            Transaction(
                business_id=business.id,
                transaction_date=today - timedelta(days=25),
                amount=Decimal("-12000.00"),
                category="raw_material",
                description="Bulk red clay and organic glaze pigments purchase",
            ),
            Transaction(
                business_id=business.id,
                transaction_date=today - timedelta(days=20),
                amount=Decimal("18500.00"),
                category="sales",
                description="Puri local craft store weekly order",
            ),
            Transaction(
                business_id=business.id,
                transaction_date=today - timedelta(days=16),
                amount=Decimal("-8500.00"),
                category="payroll",
                description="Bi-weekly artisan wages for 3 village weavers",
            ),
            Transaction(
                business_id=business.id,
                transaction_date=today - timedelta(days=12),
                amount=Decimal("-3500.00"),
                category="utilities",
                description="Kiln heating fuel & workshop electricity",
            ),
            Transaction(
                business_id=business.id,
                transaction_date=today - timedelta(days=8),
                amount=Decimal("24000.00"),
                category="sales",
                description="Direct customer bulk wedding order delivery",
            ),
            Transaction(
                business_id=business.id,
                transaction_date=today - timedelta(days=5),
                amount=Decimal("-6000.00"),
                category="transport",
                description="Logistics & freight to regional distribution hub",
            ),
            Transaction(
                business_id=business.id,
                transaction_date=today - timedelta(days=2),
                amount=Decimal("14500.00"),
                category="sales",
                description="Village weekly market sales collection",
            ),
        ]
        db.add_all(transactions)

        print("Seeding pending receivables...")
        receivables = [
            Receivable(
                business_id=business.id,
                customer_name="Odisha State Handloom Emporium",
                invoice_number="INV-2026-081",
                amount=Decimal("22500.00"),
                due_date=today + timedelta(days=7),
                expected_date=today + timedelta(days=9),
                status="pending",
                reliability_score=0.95,
            ),
            Receivable(
                business_id=business.id,
                customer_name="Konark Heritage Souvenirs",
                invoice_number="INV-2026-084",
                amount=Decimal("14000.00"),
                due_date=today + timedelta(days=18),
                expected_date=today + timedelta(days=22),
                status="pending",
                reliability_score=0.85,
            ),
        ]
        db.add_all(receivables)

        print("Seeding upcoming payables...")
        payables = [
            Payable(
                business_id=business.id,
                vendor_name="Puri Potter's Clay Guild",
                bill_number="BILL-4412",
                amount=Decimal("11000.00"),
                due_date=today + timedelta(days=5),
                priority_tier=1,
                status="unpaid",
            ),
            Payable(
                business_id=business.id,
                vendor_name="Sundargram Packaging Cooperative",
                bill_number="BILL-9104",
                amount=Decimal("4500.00"),
                due_date=today + timedelta(days=14),
                priority_tier=2,
                status="unpaid",
            ),
        ]
        db.add_all(payables)

        print("Seeding regular expenses...")
        expenses = [
            Expense(
                business_id=business.id,
                category="rent",
                amount=Decimal("4000.00"),
                frequency="monthly",
                description="Community workshop center lease",
                due_date=today.replace(day=1) + timedelta(days=32),
                is_recurring=True,
            ),
            Expense(
                business_id=business.id,
                category="electricity",
                amount=Decimal("1800.00"),
                frequency="monthly",
                description="Workshop power and kiln exhaust fan",
                due_date=today.replace(day=10),
                is_recurring=True,
            ),
        ]
        db.add_all(expenses)

        print("Seeding business financial structuring goal...")
        goal = BusinessGoal(
            business_id=business.id,
            title="Electric Pottery Wheel & Solar Kiln Upgrade",
            target_amount=Decimal("85000.00"),
            current_amount=Decimal("25000.00"),
            deadline=today + timedelta(days=120),
            priority="high",
            status="in_progress",
        )
        db.add(goal)

        db.commit()
        print("Demo rural micro-enterprise data successfully seeded!")
    finally:
        db.close()


if __name__ == "__main__":
    seed_data()
