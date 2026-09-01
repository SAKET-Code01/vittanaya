"""Industry Template Declarative Specifications for VITTANAYA (SIH26091).

Defines input field definitions, KPI calculation functions, benchmark thresholds,
and risk signal rules for Manufacturing, Retail, Restaurant, Transport, Services, and Creator sectors.
"""

from typing import Any, Dict

# Supported Industry Codes
INDUSTRY_MANUFACTURING = "MANUFACTURING"
INDUSTRY_RETAIL = "RETAIL"
INDUSTRY_RESTAURANT = "RESTAURANT"
INDUSTRY_TRANSPORT = "TRANSPORT"
INDUSTRY_SERVICES = "SERVICES"
INDUSTRY_CREATOR = "CREATOR"

SUPPORTED_INDUSTRIES = [
    INDUSTRY_MANUFACTURING,
    INDUSTRY_RETAIL,
    INDUSTRY_RESTAURANT,
    INDUSTRY_TRANSPORT,
    INDUSTRY_SERVICES,
    INDUSTRY_CREATOR,
]

INDUSTRY_CONFIGS: Dict[str, Dict[str, Any]] = {
    INDUSTRY_MANUFACTURING: {
        "display_name": "Manufacturing & Production",
        "description": "Plant capacity, raw material utilization, wastage, unit cost, and production break-even analysis.",
        "fields": [
            {"key": "machinery_investment", "label": "Machinery Investment", "unit": "INR", "type": "float", "default": 300000.0},
            {"key": "raw_material_cost_pct", "label": "Raw Material Cost Ratio", "unit": "%", "type": "float", "default": 55.0},
            {"key": "production_capacity_units", "label": "Monthly Capacity", "unit": "Units", "type": "float", "default": 10000.0},
            {"key": "utilization_pct", "label": "Capacity Utilization", "unit": "%", "type": "float", "default": 70.0},
            {"key": "wastage_pct", "label": "Wastage / Scrap Loss", "unit": "%", "type": "float", "default": 4.0},
            {"key": "selling_price_per_unit", "label": "Selling Price per Unit", "unit": "INR", "type": "float", "default": 100.0},
            {"key": "unit_cost", "label": "Direct Cost per Unit", "unit": "INR", "type": "float", "default": 65.0},
        ],
        "default_scenario": {"name": "Raw Material Price Hike (+10%)", "parameter": "raw_material_cost_pct", "change": 10.0},
    },
    INDUSTRY_RETAIL: {
        "display_name": "Retail & Trade",
        "description": "Store footfall, average basket size, inventory turnover, and gross margin optimization.",
        "fields": [
            {"key": "monthly_footfall", "label": "Monthly Customer Footfall", "unit": "Customers", "type": "float", "default": 2500.0},
            {"key": "average_transaction_value", "label": "Avg Transaction Value", "unit": "INR", "type": "float", "default": 450.0},
            {"key": "gross_margin_pct", "label": "Gross Margin Ratio", "unit": "%", "type": "float", "default": 25.0},
            {"key": "inventory_value", "label": "Current Inventory Value", "unit": "INR", "type": "float", "default": 150000.0},
            {"key": "stock_holding_days", "label": "Stock Holding Period", "unit": "Days", "type": "float", "default": 45.0},
        ],
        "default_scenario": {"name": "Customer Footfall Drop (-20%)", "parameter": "monthly_footfall", "change": -20.0},
    },
    INDUSTRY_RESTAURANT: {
        "display_name": "Restaurant & Food Service",
        "description": "Seating capacity, daily order volume, food cost ratio, and seat turnover metrics.",
        "fields": [
            {"key": "seating_capacity", "label": "Seating Capacity", "unit": "Seats", "type": "float", "default": 40.0},
            {"key": "daily_orders", "label": "Average Daily Orders", "unit": "Orders/Day", "type": "float", "default": 80.0},
            {"key": "average_order_value", "label": "Average Order Value", "unit": "INR", "type": "float", "default": 180.0},
            {"key": "food_cost_pct", "label": "Food Cost Ratio", "unit": "%", "type": "float", "default": 35.0},
            {"key": "staff_cost_monthly", "label": "Monthly Kitchen/Staff Payroll", "unit": "INR", "type": "float", "default": 45000.0},
            {"key": "operating_days_monthly", "label": "Operating Days per Month", "unit": "Days", "type": "float", "default": 26.0},
        ],
        "default_scenario": {"name": "Daily Order Volume Drop (-15%)", "parameter": "daily_orders", "change": -15.0},
    },
    INDUSTRY_TRANSPORT: {
        "display_name": "Transport & Logistics",
        "description": "Fleet size, monthly trip volume, fuel expense sensitivity, and vehicle productivity.",
        "fields": [
            {"key": "vehicle_count", "label": "Fleet Size (Vehicles)", "unit": "Vehicles", "type": "float", "default": 3.0},
            {"key": "monthly_trips_per_vehicle", "label": "Trips per Vehicle / Month", "unit": "Trips", "type": "float", "default": 40.0},
            {"key": "average_fare_per_trip", "label": "Average Revenue per Trip", "unit": "INR", "type": "float", "default": 2500.0},
            {"key": "fuel_cost_per_trip", "label": "Fuel Cost per Trip", "unit": "INR", "type": "float", "default": 950.0},
            {"key": "maintenance_cost_monthly", "label": "Monthly Fleet Maintenance", "unit": "INR", "type": "float", "default": 15000.0},
        ],
        "default_scenario": {"name": "Fuel Price Surge (+10%)", "parameter": "fuel_cost_per_trip", "change": 10.0},
    },
    INDUSTRY_SERVICES: {
        "display_name": "IT & Professional Services",
        "description": "Client retainer billing, staff utilization, revenue per employee, and client concentration risk.",
        "fields": [
            {"key": "active_clients", "label": "Active Retainer Clients", "unit": "Clients", "type": "float", "default": 8.0},
            {"key": "average_monthly_billing_per_client", "label": "Avg Monthly Client Billing", "unit": "INR", "type": "float", "default": 35000.0},
            {"key": "headcount", "label": "Team / Staff Headcount", "unit": "Members", "type": "float", "default": 4.0},
            {"key": "average_salary_per_employee", "label": "Avg Monthly Salary / Member", "unit": "INR", "type": "float", "default": 30000.0},
            {"key": "recurring_revenue_pct", "label": "Recurring Contract Share", "unit": "%", "type": "float", "default": 75.0},
        ],
        "default_scenario": {"name": "Major Client Loss (-25% Billing)", "parameter": "active_clients", "change": -25.0},
    },
    INDUSTRY_CREATOR: {
        "display_name": "Digital & Content Creator",
        "description": "Subscription retainers, sponsorship income, platform ad revenue, and equipment payback.",
        "fields": [
            {"key": "equipment_investment", "label": "Production Equipment CapEx", "unit": "INR", "type": "float", "default": 150000.0},
            {"key": "recurring_subscription_revenue", "label": "Monthly Subscriptions / Memberships", "unit": "INR", "type": "float", "default": 35000.0},
            {"key": "sponsorship_revenue_monthly", "label": "Monthly Sponsorship / Brand Deals", "unit": "INR", "type": "float", "default": 45000.0},
            {"key": "platform_ad_revenue_monthly", "label": "Monthly Platform Ad Revenue", "unit": "INR", "type": "float", "default": 20000.0},
            {"key": "production_cost_monthly", "label": "Monthly Production / Editing Outflow", "unit": "INR", "type": "float", "default": 25000.0},
        ],
        "default_scenario": {"name": "Sponsorship Income Drop (-25%)", "parameter": "sponsorship_revenue_monthly", "change": -25.0},
    },
}
