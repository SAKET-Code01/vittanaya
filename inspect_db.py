from backend.app.core.database import SessionLocal, engine, auto_migrate_sqlite_schema
auto_migrate_sqlite_schema(engine)
db = SessionLocal()

from backend.app.models.ahp import AHPExpert, AHPPairwiseComparison
experts = db.query(AHPExpert).all()
comparisons = db.query(AHPPairwiseComparison).all()
print(f"Real experts stored in DB: {len(experts)}")
print(f"Real pairwise responses stored in DB: {len(comparisons)}")

from backend.app.models.business import Business
businesses = db.query(Business).all()
print(f"Total Businesses in DB: {len(businesses)}")
for b in businesses:
    print(f"ID={b.id} | Name='{b.name}' | Type='{b.type}' | Industry='{b.industry}' | District='{b.location_district}' | Cost={b.project_cost} | OwnCapital={b.own_capital}")

from backend.app.models.market_data import LocalMarketData
market_records = db.query(LocalMarketData).all()
print(f"LocalMarketData records: {len(market_records)}")
for m in market_records:
    print(f"  District='{m.district}' | Sector='{m.sector}' | Competitors={m.competitor_count} | BaseScore={m.base_score}")

from backend.app.services.ahp_service import get_ahp_audit_trail
audit = get_ahp_audit_trail(db)
print("\nAHP Audit Trail Summary:")
print("AHP Dataset Status:", audit.get("ahp_dataset_status"))
print("Real Expert Validation Status:", audit.get("real_expert_validation_status"))
print("Expert Count:", audit.get("expert_count"))
print("Completed Comparison Count:", audit.get("completed_comparison_count"))
print("AHP Weights:", audit.get("normalized_ahp_priority_weights"))
print("Dashboard Points:", audit.get("dashboard_point_allocation"))
print("CR:", audit.get("cr"))
print("Is Consistent:", audit.get("is_consistent"))
