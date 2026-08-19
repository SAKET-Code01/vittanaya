/**
 * VITTANAYA — Canonical Dashboard Mock Data & Multi-Industry Architecture Layer
 * 
 * Strictly conforms to Phase 1 FastAPI data contracts defined in docs/03_ARCHITECTURE.md
 * and docs/04_DATA_DESIGN.md.
 * 
 * Note: All financial values are stored in INR (₹).
 * Components consume this decoupled mock layer without direct business calculations.
 * 
 * CRITICAL RULE:
 * Universal pre-registration data must NEVER assume developer identity (Arpit)
 * or any specific single business/industry (Transport/Friend's Roadways).
 */

// ==========================================
// 1. Universal MSME Profile & Industry Presets
// ==========================================

export const INDUSTRY_PRESETS = {
  universal: {
    id: 'universal',
    name: 'Universal MSME Profile',
    category: 'Cross-Industry Decision Support',
    industry: 'Universal Working Capital Twin',
    gstin: '21AAACV0000U1Z9',
    user_name: 'Business Owner',
    user_role: 'Finance & Operations',
    min_cash_buffer: 500000,
    pulse: {
      status: 'Stable',
      color: 'emerald',
      score: 84,
      message: 'All scheduled outflows are fully covered with an adequate 38-day cash runway cushion.',
    },
    signals: [
      { label: 'Delayed Collections', status: 'Medium Risk', level: 'medium', detail: '1 customer invoice projected ~28d delay' },
      { label: 'Cash Buffer Cushion', status: 'Healthy', level: 'positive', detail: '+₹1.4L cushion preserved at Day 18 low point' },
      { label: 'Expense Pressure', status: 'Low', level: 'positive', detail: '30d expected inflow (₹9.3L) exceeds outflow (₹7.2L)' },
    ],
    attentionFeed: [
      {
        id: 'att-1',
        title: 'Receivables Delay Flagged',
        tag: 'HIGH RISK INVOICE',
        tagType: 'danger',
        desc: 'Invoice INV-101 (Acme Global, ₹2,50,000) due Aug 31 has a projected 28-day collection delay based on payment history.',
        actionHint: 'Incentivize early collection with 2% discount',
      },
      {
        id: 'att-2',
        title: 'Month-End Outflow Cluster',
        tag: 'CRITICAL SETTLEMENT',
        tagType: 'warning',
        desc: 'Staff wages (₹1,20,000) and primary supplier bill (₹80,000) coincide between Aug 28–30.',
        actionHint: 'Confirmed cash balance of ₹14.85L safely absorbs both obligations',
      },
      {
        id: 'att-3',
        title: 'Projected Cash Trough on Day 18',
        tag: 'FORECAST INFLECTION',
        tagType: 'info',
        desc: 'Cash reaches rolling 30-day low of ₹6,40,000 on Sep 02 before rebounding with early September receivables.',
        actionHint: 'Buffer remains +₹1.40L above the ₹5.0L minimum safety threshold',
        whyKey: 'lowest_projected_cash',
      },
    ],
    contextSummary: 'Universal MSME working-capital model applicable across manufacturing, services, retail, and trade.',
  },
  manufacturing: {
    id: 'manufacturing',
    name: 'Apex Steel Fabrication Ltd.',
    category: 'Heavy Engineering & Metal Fabrication',
    industry: 'Steel & Industrial Components',
    gstin: '21AABCK9876M1Z2',
    user_name: 'Vikram Sharma',
    user_role: 'Managing Director',
    min_cash_buffer: 600000,
    pulse: {
      status: 'Watch',
      color: 'amber',
      score: 74,
      message: 'Raw steel price fluctuations and 45-day OEM payment cycles require close working capital monitoring.',
    },
    signals: [
      { label: 'OEM Payment Delays', status: 'Medium Risk', level: 'medium', detail: 'Bhilai Forgings batch delayed 25 days' },
      { label: 'Raw Scrap Inventory', status: 'Moderate', level: 'warning', detail: '₹1.4L scrap payable due Aug 29' },
      { label: 'Furnace Power Costs', status: 'Fixed Obligation', level: 'positive', detail: 'HT electric bill (₹95k) scheduled Sep 02' },
    ],
    attentionFeed: [
      {
        id: 'att-mfg-1',
        title: 'OEM Inspection Delay',
        tag: 'DELAYED INVOICE',
        tagType: 'warning',
        desc: 'Tata Motors Commercial OEM invoice (₹3,80,000) pending 45-day quality clearance cycle.',
        actionHint: 'Follow up with OEM quality department',
      },
      {
        id: 'att-mfg-2',
        title: 'Plant Machinery Payroll',
        tag: 'FIXED OBLIGATION',
        tagType: 'info',
        desc: 'Factory CNC machinists payroll (₹1,80,000) scheduled for release on Aug 30.',
        actionHint: 'Funds reserved in bank account',
      },
    ],
    contextSummary: 'Heavy manufacturing workflow tracking steel suppliers, OEM purchase orders, and plant power expenses.',
  },
  transport: {
    id: 'transport',
    name: 'National Cargo Movers Pvt. Ltd.',
    category: 'Logistics & Freight Transport MSME',
    industry: 'Fleet & Cargo Transit',
    gstin: '21AABCF1234F1Z8',
    user_name: 'Rajesh Verma',
    user_role: 'Operations Director',
    min_cash_buffer: 500000,
    pulse: {
      status: 'Stable',
      color: 'emerald',
      score: 84,
      message: 'Diesel fuel credits and FASTag settlements balanced with corporate client freight remittances.',
    },
    signals: [
      { label: 'Freight Billing Delays', status: 'Medium Risk', level: 'medium', detail: 'Mining freight invoice delayed 27 days' },
      { label: 'Bulk Diesel Credit', status: 'Controlled', level: 'positive', detail: 'IOCL depot settlement (₹1.1L) on Aug 28' },
      { label: 'Driver Mileage Wages', status: 'Scheduled', level: 'positive', detail: 'Fleet payroll (₹95k) due Aug 30' },
    ],
    attentionFeed: [
      {
        id: 'att-trp-1',
        title: 'Mining Bulk Freight Delay',
        tag: 'DELAYED COLLECTION',
        tagType: 'danger',
        desc: 'Orissa Mining bulk freight invoice (₹4,10,000) due Sep 05 has historical 27-day processing bottleneck.',
        actionHint: 'Submit secondary consignment POD confirmation',
      },
      {
        id: 'att-trp-2',
        title: 'Depot Bulk Fuel Settlement',
        tag: 'FLEET SETTLEMENT',
        tagType: 'warning',
        desc: 'Indian Oil diesel credit settlement (₹1,10,000) due on Aug 28.',
        actionHint: 'Covered via active liquid bank balance',
      },
    ],
    contextSummary: 'Interstate logistics operations tracking trip cash burns, fuel depot credit lines, and corporate freight receivables.',
  },
  retail: {
    id: 'retail',
    name: 'Metro Superstores Wholesale',
    category: 'Wholesale & FMCG Distribution',
    industry: 'Consumer Goods & Superstores',
    gstin: '21AABCM5432R1Z5',
    user_name: 'Priya Patel',
    user_role: 'General Manager',
    min_cash_buffer: 400000,
    pulse: {
      status: 'Stable',
      color: 'emerald',
      score: 89,
      message: 'High inventory turnover with predictable weekend customer cash flow surges.',
    },
    signals: [
      { label: 'Distributor Terms', status: 'Healthy', level: 'positive', detail: '30-day revolving credit line active' },
      { label: 'Store POS Inflows', status: 'Strong', level: 'positive', detail: 'Daily merchant card settlements on schedule' },
      { label: 'Warehouse Restock', status: 'Scheduled', level: 'info', detail: 'FMCG bulk reorder due Sep 03' },
    ],
    attentionFeed: [
      {
        id: 'att-ret-1',
        title: 'FMCG Bulk Restocking Due',
        tag: 'SUPPLIER REORDER',
        tagType: 'info',
        desc: 'Quarterly packaged food distributor settlement (₹1,50,000) due on Sep 03.',
        actionHint: 'Supported by projected weekend retail inflows',
      },
    ],
    contextSummary: 'Retail distribution tracking distributor credits, merchant terminal settlements, and bulk perishable restocking.',
  },
  restaurant: {
    id: 'restaurant',
    name: 'Grand Bay Kitchen & Banquets',
    category: 'Hospitality & Food Services',
    industry: 'Fine Dining & Corporate Catering',
    gstin: '21AABCG7890H1Z3',
    user_name: 'Anita Sen',
    user_role: 'Managing Partner',
    min_cash_buffer: 350000,
    pulse: {
      status: 'Stable',
      color: 'emerald',
      score: 82,
      message: 'Daily guest billing offsets weekly vegetable, poultry, and beverage distributor bills.',
    },
    signals: [
      { label: 'Perishable Food Costs', status: 'Controlled', level: 'positive', detail: 'Weekly vendor settlements clearing' },
      { label: 'Banquet Advances', status: 'Positive Buffer', level: 'positive', detail: '₹2.4L wedding banquet advances in bank' },
      { label: 'Kitchen Payroll', status: 'Committed', level: 'info', detail: 'Staff salary (₹1.2L) due Aug 30' },
    ],
    attentionFeed: [
      {
        id: 'att-res-1',
        title: 'Corporate Catering Invoicing',
        tag: 'OUTSTANDING INVOICE',
        tagType: 'warning',
        desc: 'Tech park corporate cafeteria contract invoice (₹1,85,000) due Sep 12.',
        actionHint: 'Send milestone reminder to HR department',
      },
    ],
    contextSummary: 'Hospitality venue with daily POS inflows, banquet advance deposits, and weekly perishable supplier bills.',
  },
  services: {
    id: 'services',
    name: 'NovaByte Tech Solutions LLP',
    category: 'IT Services & Software Consulting',
    industry: 'Technology & Enterprise Solutions',
    gstin: '21AABCN3210S1Z1',
    user_name: 'Kunal Mehta',
    user_role: 'Managing Partner',
    min_cash_buffer: 450000,
    pulse: {
      status: 'Stable',
      color: 'emerald',
      score: 91,
      message: 'Milestone billing on active client software sprints with manageable cloud server overhead.',
    },
    signals: [
      { label: 'Client Retainers', status: 'Predictable', level: 'positive', detail: 'Monthly recurring retainers on track' },
      { label: 'Cloud Infrastructure', status: 'Low Cost', level: 'positive', detail: 'AWS/GCP server bills automated' },
      { label: 'Developer Payroll', status: 'Committed', level: 'info', detail: 'Engineering wages due Aug 30' },
    ],
    attentionFeed: [
      {
        id: 'att-srv-1',
        title: 'Enterprise Client Milestone 2',
        tag: 'RETAINER MILESTONE',
        tagType: 'positive',
        desc: 'US client sprint milestone invoice ($4,200 / ₹3,40,000) scheduled for wire release on Sep 08.',
        actionHint: 'Expected wire clearance within 48 hours',
      },
    ],
    contextSummary: 'Service agency tracking monthly recurring SaaS billings, international client wire transfers, and developer payroll.',
  },
};

export const MOCK_COMPANY_PROFILE = INDUSTRY_PRESETS.universal;

// ==========================================
// 2. Canonical Dashboard Summary
// ==========================================

export const MOCK_DASHBOARD_SUMMARY = {
  cash_balance: 1485000,
  receivables_total: 2850000,
  payables_total: 1920000,
  expected_inflow: 930000,
  expected_outflow: 720000,
  liquidity_gap: 0,
  runway_days: 38,
  lowest_projected_cash: 640000,
};

// ==========================================
// 3. Causal Explanations ("Why?")
// ==========================================

export const MOCK_EXPLANATIONS = {
  lowest_projected_cash: {
    title: 'Why is the lowest projected cash ₹6,40,000 on Sep 2?',
    summary: 'A temporary cash trough occurs on Day 18 due to overlapping supplier settlements and payroll occurring before scheduled customer collections clear.',
    factors: [
      {
        factor: 'Month-End Payroll & Supplier Settlements',
        impact: '-₹3,20,000',
        detail: 'End-of-month employee wage distribution and primary vendor accounts coincide between Aug 30–Sep 01.',
      },
      {
        factor: 'Customer Payment Delay (Acme Global)',
        impact: '-₹2,50,000 delayed by 28 days',
        detail: 'Invoice INV-101 due on Aug 31 is historically delayed by ~28 days, shifting cash realization into late September.',
      },
      {
        factor: 'Preserved Safety Buffer Cushion',
        impact: '+₹1,40,000 buffer',
        detail: 'Closing balance of ₹6,40,000 preserves a healthy ₹1,40,000 cushion above the mandatory ₹5,00,000 safety threshold.',
      },
    ],
    recommendation: 'No emergency borrowing is needed. Offering a 2% early settlement discount on Invoice INV-108 can bring forward ₹1,17,600 extra cash if desired.',
  },
  liquidity_gap: {
    title: 'Why is the Liquidity Gap ₹0 (Secure)?',
    summary: 'The total 30-day expected inflow (₹9,30,000) exceeds scheduled operational outflows (₹7,20,000), generating a net positive cash surplus of +₹2,10,000.',
    factors: [
      {
        factor: 'Total Expected Inflow',
        impact: '+₹9,30,000',
        detail: 'Realized customer collections adjusted for historical payment delays.',
      },
      {
        factor: 'Total Scheduled Outflow',
        impact: '-₹7,20,000',
        detail: 'Mandatory operational overhead, vendor payables, and recurring payroll.',
      },
      {
        factor: 'Net 30-Day Liquidity Surplus',
        impact: '+₹2,10,000',
        detail: 'Operating surplus adds directly to reserves, maintaining a 38-day cash runway.',
      },
    ],
    recommendation: 'Maintain disciplined follow-up on 30-day customer receivables to ensure expected realization timelines stay on track.',
  },
  runway_days: {
    title: 'How is the 38-Day Cash Runway calculated?',
    summary: 'Runway measures how many days the business can continue operating under scheduled inflow and outflow commitments before dipping below the minimum ₹5,00,000 buffer.',
    factors: [
      {
        factor: 'Starting Verified Liquid Cash',
        impact: '₹14,85,000',
        detail: 'Available ledger balance across all verified business bank accounts.',
      },
      {
        factor: 'Average Daily Operational Outflow',
        impact: '₹24,000 / day',
        detail: 'Normalized scheduled expenditure across the 30-day period.',
      },
      {
        factor: 'Forecast Trough Point',
        impact: 'Day 18 (Sep 02)',
        detail: 'Lowest balance reaches ₹6.4L and rebounds upward with subsequent receivables collections.',
      },
    ],
    recommendation: 'Runway is in the optimal HEALTHY range. Monitor 45-day vendor obligations to prevent unexpected lump-sum settlements.',
  },
};

// ==========================================
// 4. Cash Flow Forecast Horizons (30D, 60D, 90D)
// ==========================================

export const MOCK_CASH_FLOW_FORECAST_30D = [
  { date: "16 Aug", full_date: "2026-08-16", opening_cash: 1485000, inflow: 50000, outflow: 30000, closing_cash: 1505000 },
  { date: "17 Aug", full_date: "2026-08-17", opening_cash: 1505000, inflow: 35000, outflow: 20000, closing_cash: 1520000 },
  { date: "18 Aug", full_date: "2026-08-18", opening_cash: 1520000, inflow: 10000, outflow: 45000, closing_cash: 1485000 },
  { date: "19 Aug", full_date: "2026-08-19", opening_cash: 1485000, inflow: 80000, outflow: 15000, closing_cash: 1550000 },
  { date: "20 Aug", full_date: "2026-08-20", opening_cash: 1550000, inflow: 25000, outflow: 60000, closing_cash: 1515000 },
  { date: "21 Aug", full_date: "2026-08-21", opening_cash: 1515000, inflow: 90000, outflow: 25000, closing_cash: 1580000 },
  { date: "22 Aug", full_date: "2026-08-22", opening_cash: 1580000, inflow: 15000, outflow: 10000, closing_cash: 1585000 },
  { date: "23 Aug", full_date: "2026-08-23", opening_cash: 1585000, inflow: 5000, outflow: 5000, closing_cash: 1585000 },
  { date: "24 Aug", full_date: "2026-08-24", opening_cash: 1585000, inflow: 65000, outflow: 75000, closing_cash: 1575000 },
  { date: "25 Aug", full_date: "2026-08-25", opening_cash: 1575000, inflow: 40000, outflow: 180000, closing_cash: 1435000 },
  { date: "26 Aug", full_date: "2026-08-26", opening_cash: 1435000, inflow: 20000, outflow: 90000, closing_cash: 1365000 },
  { date: "27 Aug", full_date: "2026-08-27", opening_cash: 1365000, inflow: 45000, outflow: 110000, closing_cash: 1300000 },
  { date: "28 Aug", full_date: "2026-08-28", opening_cash: 1300000, inflow: 15000, outflow: 240000, closing_cash: 1075000 },
  { date: "29 Aug", full_date: "2026-08-29", opening_cash: 1075000, inflow: 30000, outflow: 85000, closing_cash: 1020000 },
  { date: "30 Aug", full_date: "2026-08-30", opening_cash: 1020000, inflow: 10000, outflow: 320000, closing_cash: 710000 },
  { date: "31 Aug", full_date: "2026-08-31", opening_cash: 710000, inflow: 25000, outflow: 45000, closing_cash: 690000 },
  { date: "01 Sep", full_date: "2026-09-01", opening_cash: 690000, inflow: 40000, outflow: 60000, closing_cash: 670000 },
  { date: "02 Sep", full_date: "2026-09-02", opening_cash: 670000, inflow: 20000, outflow: 50000, closing_cash: 640000 }, // Lowest point ₹6,40,000 (Day 18)
  { date: "03 Sep", full_date: "2026-09-03", opening_cash: 640000, inflow: 140000, outflow: 30000, closing_cash: 750000 },
  { date: "04 Sep", full_date: "2026-09-04", opening_cash: 750000, inflow: 85000, outflow: 25000, closing_cash: 810000 },
  { date: "05 Sep", full_date: "2026-09-05", opening_cash: 810000, inflow: 120000, outflow: 35000, closing_cash: 895000 },
  { date: "06 Sep", full_date: "2026-09-06", opening_cash: 895000, inflow: 30000, outflow: 15000, closing_cash: 910000 },
  { date: "07 Sep", full_date: "2026-09-07", opening_cash: 910000, inflow: 75000, outflow: 40000, closing_cash: 945000 },
  { date: "08 Sep", full_date: "2026-09-08", opening_cash: 945000, inflow: 95000, outflow: 30000, closing_cash: 1010000 },
  { date: "09 Sep", full_date: "2026-09-09", opening_cash: 1010000, inflow: 60000, outflow: 25000, closing_cash: 1045000 },
  { date: "10 Sep", full_date: "2026-09-10", opening_cash: 1045000, inflow: 110000, outflow: 50000, closing_cash: 1105000 },
  { date: "11 Sep", full_date: "2026-09-11", opening_cash: 1105000, inflow: 45000, outflow: 20000, closing_cash: 1130000 },
  { date: "12 Sep", full_date: "2026-09-12", opening_cash: 1130000, inflow: 30000, outflow: 15000, closing_cash: 1145000 },
  { date: "13 Sep", full_date: "2026-09-13", opening_cash: 1145000, inflow: 15000, outflow: 10000, closing_cash: 1150000 },
  { date: "14 Sep", full_date: "2026-09-14", opening_cash: 1150000, inflow: 85000, outflow: 35000, closing_cash: 1200000 },
];

export const MOCK_CASH_FLOW_FORECAST_60D = [
  ...MOCK_CASH_FLOW_FORECAST_30D,
  { date: "18 Sep", full_date: "2026-09-18", opening_cash: 1200000, inflow: 140000, outflow: 45000, closing_cash: 1295000 },
  { date: "22 Sep", full_date: "2026-09-22", opening_cash: 1295000, inflow: 95000, outflow: 70000, closing_cash: 1320000 },
  { date: "26 Sep", full_date: "2026-09-26", opening_cash: 1320000, inflow: 180000, outflow: 90000, closing_cash: 1410000 },
  { date: "30 Sep", full_date: "2026-09-30", opening_cash: 1410000, inflow: 60000, outflow: 310000, closing_cash: 1160000 },
  { date: "05 Oct", full_date: "2026-10-05", opening_cash: 1160000, inflow: 190000, outflow: 55000, closing_cash: 1295000 },
  { date: "10 Oct", full_date: "2026-10-10", opening_cash: 1295000, inflow: 150000, outflow: 60000, closing_cash: 1385000 },
  { date: "15 Oct", full_date: "2026-10-15", opening_cash: 1385000, inflow: 175000, outflow: 80000, closing_cash: 1480000 },
];

export const MOCK_CASH_FLOW_FORECAST_90D = [
  ...MOCK_CASH_FLOW_FORECAST_60D,
  { date: "20 Oct", full_date: "2026-10-20", opening_cash: 1480000, inflow: 160000, outflow: 75000, closing_cash: 1565000 },
  { date: "25 Oct", full_date: "2026-10-25", opening_cash: 1565000, inflow: 120000, outflow: 90000, closing_cash: 1595000 },
  { date: "30 Oct", full_date: "2026-10-30", opening_cash: 1595000, inflow: 80000, outflow: 340000, closing_cash: 1335000 },
  { date: "05 Nov", full_date: "2026-11-05", opening_cash: 1335000, inflow: 210000, outflow: 60000, closing_cash: 1485000 },
  { date: "10 Nov", full_date: "2026-11-10", opening_cash: 1485000, inflow: 160000, outflow: 70000, closing_cash: 1575000 },
  { date: "15 Nov", full_date: "2026-11-15", opening_cash: 1575000, inflow: 180000, outflow: 85000, closing_cash: 1670000 },
];

// ==========================================
// 5. Universal & Contextual Receivables/Payables
// ==========================================

export const INDUSTRY_OPERATIONAL_DATA = {
  universal: {
    receivables: [
      {
        invoice_id: "INV-101",
        customer: "Acme Global Industries",
        amount: 250000,
        due_date: "2026-08-31",
        status: "Pending",
        risk: "HIGH",
        expected_payment_date: "2026-09-28",
        notes: "Historical payment latency of ~28 days past contractual due date.",
      },
      {
        invoice_id: "INV-108",
        customer: "Zenith Retail Distributors",
        amount: 120000,
        due_date: "2026-09-02",
        status: "Pending",
        risk: "MEDIUM",
        expected_payment_date: "2026-09-05",
        notes: "Consistent on-time payer with minor 3-day batch settlement window.",
      },
      {
        invoice_id: "INV-112",
        customer: "Apex Logistics Hub",
        amount: 340000,
        due_date: "2026-09-08",
        status: "Pending",
        risk: "LOW",
        expected_payment_date: "2026-09-08",
        notes: "Automated electronic wire remittance upon invoice verification.",
      },
      {
        invoice_id: "INV-115",
        customer: "Prime Industrial Services",
        amount: 185000,
        due_date: "2026-09-12",
        status: "Pending",
        risk: "MEDIUM",
        expected_payment_date: "2026-09-18",
        notes: "Monthly milestone settlement cycle.",
      },
    ],
    payables: [
      {
        bill_id: "BILL-201",
        supplier: "Industrial Power & Utilities",
        amount: 80000,
        due_date: "2026-08-28",
        status: "Pending",
        priority: "HIGH",
        category: "Operational Utilities",
      },
      {
        bill_id: "BILL-202",
        supplier: "Consolidated Staff Wages",
        amount: 120000,
        due_date: "2026-08-30",
        status: "Pending",
        priority: "HIGH",
        category: "Payroll Obligations",
      },
      {
        bill_id: "BILL-205",
        supplier: "Commercial Facility Lease",
        amount: 45000,
        due_date: "2026-09-03",
        status: "Pending",
        priority: "MEDIUM",
        category: "Fixed Overhead",
      },
      {
        bill_id: "BILL-209",
        supplier: "Statutory Compliance & Audit",
        amount: 65000,
        due_date: "2026-09-10",
        status: "Pending",
        priority: "MEDIUM",
        category: "Statutory Obligations",
      },
    ],
  },
  manufacturing: {
    receivables: [
      {
        invoice_id: "INV-MFG-301",
        customer: "Tata Motors Commercial OEM",
        amount: 380000,
        due_date: "2026-08-30",
        status: "Pending",
        risk: "MEDIUM",
        expected_payment_date: "2026-09-15",
        notes: "OEM 45-day inspection quality clearance cycle.",
      },
      {
        invoice_id: "INV-MFG-308",
        customer: "Bhilai Forgings Dist.",
        amount: 220000,
        due_date: "2026-09-04",
        status: "Pending",
        risk: "HIGH",
        expected_payment_date: "2026-09-29",
        notes: "Overdue collection history on previous batches.",
      },
    ],
    payables: [
      {
        bill_id: "BILL-RAW-101",
        supplier: "SAIL Steel Scrap Syndicate",
        amount: 140000,
        due_date: "2026-08-29",
        status: "Pending",
        priority: "HIGH",
        category: "Raw Material Inventory",
      },
      {
        bill_id: "BILL-RAW-102",
        supplier: "Factory CNC Machinists Payroll",
        amount: 180000,
        due_date: "2026-08-30",
        status: "Pending",
        priority: "HIGH",
        category: "Plant Payroll",
      },
    ],
  },
};

export const MOCK_UPCOMING_RECEIVABLES = INDUSTRY_OPERATIONAL_DATA.universal.receivables;
export const MOCK_UPCOMING_PAYABLES = INDUSTRY_OPERATIONAL_DATA.universal.payables;

// ==========================================
// 6. Utility Functions
// ==========================================

export function formatINR(amount, includeSymbol = true) {
  if (amount === undefined || amount === null) return "-";
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(amount);
  return includeSymbol ? `₹${formatted}` : formatted;
}

export function formatINRLakhs(amount) {
  if (!amount && amount !== 0) return "-";
  if (Math.abs(amount) >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (Math.abs(amount) >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  }
  return formatINR(amount);
}
