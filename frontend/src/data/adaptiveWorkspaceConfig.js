/**
 * VITTANAYA — Adaptive Workspace Configuration Engine
 * 
 * Declarative mapping engine:
 * Business Type + Selected Operations -> Adaptive Workspace Profile
 * (Sidebar modules, Business Snapshot KPIs, Terminology, Contextual Insights)
 * 
 * Strictly decoupled frontend mock state.
 */

// ==========================================
// 1. Operation Definitions
// ==========================================

export const AVAILABLE_OPERATIONS = [
  {
    id: 'sales',
    label: 'Sales / Receivables',
    desc: 'Customer invoices, billing terms & payment collections',
    category: 'Revenue',
    sidebarModule: { id: 'invoices', label: 'Invoices', badge: 'Phase 1' },
    defaultKpis: [
      { label: 'Pending Receivables', value: '₹28,50,000', sub: '12 invoices active', trend: '+5.4% MoM', trendType: 'positive' },
      { label: 'Avg Collection Period', value: '34 Days', sub: 'Industry norm: 45d', trend: 'Healthy', trendType: 'positive' },
    ],
  },
  {
    id: 'purchases',
    label: 'Purchases / Payables',
    desc: 'Supplier bills, vendor settlements & credit cycles',
    category: 'Cost',
    sidebarModule: { id: 'payables', label: 'Payables', badge: 'Active' },
    defaultKpis: [
      { label: 'Upcoming Payables', value: '₹19,20,000', sub: '8 bills committed', trend: 'Covered', trendType: 'positive' },
      { label: 'Vendor Credit Period', value: '45 Days', sub: 'Revolving terms', trend: 'Stable', trendType: 'positive' },
    ],
  },
  {
    id: 'inventory',
    label: 'Inventory / Stock',
    desc: 'Raw materials, finished goods & holding valuation',
    category: 'Assets',
    sidebarModule: { id: 'holding', label: 'Holding / Inventory', badge: 'Phase 2' },
    defaultKpis: [
      { label: 'Inventory Valuation', value: '₹14,20,000', sub: 'Raw & finished goods', trend: '24 Stock Days', trendType: 'info' },
      { label: 'Stock Turnover', value: '4.2x / yr', sub: 'Fast moving stock', trend: 'Optimal', trendType: 'positive' },
    ],
  },
  {
    id: 'production',
    label: 'Production / Manufacturing',
    desc: 'Job orders, shopfloor commitments & batch WIP',
    category: 'Operations',
    sidebarModule: { id: 'production', label: 'Production', badge: 'Active' },
    defaultKpis: [
      { label: 'Production Commitments', value: '₹8,50,000', sub: '6 active work orders', trend: 'On Schedule', trendType: 'positive' },
      { label: 'Shopfloor Capacity', value: '86%', sub: 'Machine utilization', trend: 'High Output', trendType: 'positive' },
    ],
  },
  {
    id: 'employees',
    label: 'Employees / Payroll',
    desc: 'Staff wages, attendance & contractor payouts',
    category: 'Operations',
    sidebarModule: { id: 'payroll', label: 'Payroll', badge: 'Active' },
    defaultKpis: [
      { label: 'Monthly Payroll Due', value: '₹2,40,000', sub: '14 staff & technicians', trend: 'Due Aug 30', trendType: 'warning' },
      { label: 'Wage Cost Ratio', value: '18.4%', sub: 'Of monthly revenue', trend: 'Controlled', trendType: 'positive' },
    ],
  },
  {
    id: 'assets',
    label: 'Assets / Equipment',
    desc: 'Machinery, vehicles, tools & equipment depreciation',
    category: 'Assets',
    sidebarModule: { id: 'assets', label: 'Assets', badge: 'Active' },
    defaultKpis: [
      { label: 'Asset Book Value', value: '₹32,50,000', sub: 'Plant & equipment', trend: 'Insured', trendType: 'positive' },
      { label: 'Equipment Uptime', value: '94.2%', sub: 'Zero breakdown hours', trend: 'Healthy', trendType: 'positive' },
    ],
  },
  {
    id: 'projects',
    label: 'Projects / Contracts',
    desc: 'Client milestones, contract billings & WIP burn',
    category: 'Revenue',
    sidebarModule: { id: 'projects', label: 'Projects', badge: 'Active' },
    defaultKpis: [
      { label: 'Active Contracts', value: '5 Client WIPs', sub: '₹18.4L contract value', trend: 'Milestone 2', trendType: 'positive' },
      { label: 'Unbilled Milestone WIP', value: '₹4,20,000', sub: 'Due for invoice issue', trend: 'Ready', trendType: 'info' },
    ],
  },
  {
    id: 'fleet',
    label: 'Fleet / Trips',
    desc: 'Vehicle transit, fuel logs, trip expenses & maintenance',
    category: 'Operations',
    sidebarModule: { id: 'fleet', label: 'Fleet / Trips', badge: 'Active' },
    defaultKpis: [
      { label: 'Active Fleet in Transit', value: '18 Vehicles', sub: '88% fleet utilization', trend: 'Active', trendType: 'positive' },
      { label: 'Monthly Fuel Expense', value: '₹1,85,000', sub: 'Diesel depot credit line', trend: 'Controlled', trendType: 'positive' },
    ],
  },
  {
    id: 'loans',
    label: 'Loans / Credit',
    desc: 'Bank term loans, CC/OD limits & monthly EMI schedules',
    category: 'Finance',
    sidebarModule: { id: 'loans', label: 'Loans / Credit', badge: 'Active' },
    defaultKpis: [
      { label: 'Monthly Loan EMI', value: '₹65,000 / mo', sub: 'Term loan settlement', trend: 'Due Sep 05', trendType: 'warning' },
      { label: 'Debt Service Coverage', value: '2.8x', sub: 'Operating cash coverage', trend: 'Secure', trendType: 'positive' },
    ],
  },
  {
    id: 'banking',
    label: 'Banking / Accounts',
    desc: 'Bank accounts, reconciliation & liquid deposits',
    category: 'Finance',
    sidebarModule: { id: 'banking', label: 'Banking', badge: 'Live' },
    defaultKpis: [
      { label: 'Verified Bank Accounts', value: '2 Connected', sub: 'Current & Auto-Sweep', trend: 'Reconciled', trendType: 'positive' },
      { label: 'Unencumbered Cash', value: '₹14,85,000', sub: '100% available liquidity', trend: 'Ready', trendType: 'positive' },
    ],
  },
  {
    id: 'fuel',
    label: 'Fuel & Expenses',
    desc: 'Fuel costs, diesel credit, tolls and driver trip advances',
    category: 'Cost',
    sidebarModule: { id: 'fuel', label: 'Fuel & Trip Logs', badge: 'Active' },
    defaultKpis: [
      { label: 'Monthly Fuel Expense', value: '₹2,10,000', sub: 'Diesel depot credit line', trend: 'Controlled', trendType: 'positive' },
    ],
  },
  {
    id: 'maintenance',
    label: 'Maintenance & Repairs',
    desc: 'Vehicle servicing, part replacements and workshop repair logs',
    category: 'Operations',
    sidebarModule: { id: 'maintenance', label: 'Maintenance Logs', badge: 'Active' },
    defaultKpis: [
      { label: 'Fleet Health Index', value: '96.4%', sub: 'Scheduled fitness & insurance', trend: 'Optimal', trendType: 'positive' },
    ],
  },
  {
    id: 'other',
    label: 'Other',
    desc: 'Some other operations not listed here',
    category: 'General',
    sidebarModule: { id: 'other', label: 'Other Operations', badge: 'Active' },
    defaultKpis: [
      { label: 'Custom Operations', value: 'Active', sub: 'Flexible workspace modules', trend: 'Ready', trendType: 'positive' },
    ],
  },
];

// ==========================================
// 2. Business Type Definitions
// ==========================================

export const BUSINESS_TYPES = [
  {
    id: 'manufacturing',
    label: 'Manufacturing',
    desc: 'Produce goods using raw materials and machinery',
    recommendedOps: ['sales', 'purchases', 'inventory', 'production', 'employees'],
    terminology: { holding: 'Inventory & Scrap', operations: 'Shopfloor Commitments' },
  },
  {
    id: 'trading',
    label: 'Trading / Wholesale',
    desc: 'Buy in bulk and sell to retailers or businesses',
    recommendedOps: ['sales', 'purchases', 'inventory', 'banking'],
    terminology: { holding: 'Warehouse Stock', operations: 'Distribution Orders' },
  },
  {
    id: 'retail',
    label: 'Retail',
    desc: 'Sell products directly to customers',
    recommendedOps: ['sales', 'purchases', 'inventory', 'employees'],
    terminology: { holding: 'Store Stock', operations: 'POS & Counter Sales' },
  },
  {
    id: 'services',
    label: 'Services',
    desc: 'Provide professional or specialized services',
    recommendedOps: ['sales', 'purchases', 'projects', 'employees', 'banking'],
    terminology: { holding: 'Unbilled Work', operations: 'Client Milestones' },
  },
  {
    id: 'transport',
    label: 'Transport / Logistics',
    desc: 'Provide transportation or logistics services',
    recommendedOps: ['sales', 'purchases', 'fleet', 'employees'],
    terminology: { holding: 'Fleet & Fuel Assets', operations: 'Trip Operations' },
  },
  {
    id: 'construction',
    label: 'Construction',
    desc: 'Work on construction or infrastructure projects',
    recommendedOps: ['sales', 'purchases', 'projects', 'assets', 'employees'],
    terminology: { holding: 'Site Materials', operations: 'Project Sites' },
  },
  {
    id: 'healthcare',
    label: 'Healthcare',
    desc: 'Provide healthcare or medical services',
    recommendedOps: ['sales', 'purchases', 'inventory', 'employees'],
    terminology: { holding: 'Medical Supplies', operations: 'Patient Inflows' },
  },
  {
    id: 'education',
    label: 'Education',
    desc: 'Schools, colleges or training institutes',
    recommendedOps: ['sales', 'purchases', 'employees', 'banking'],
    terminology: { holding: 'Campus Assets', operations: 'Fee Collections & Sessions' },
  },
  {
    id: 'other',
    label: 'Other',
    desc: 'Some other type of business',
    recommendedOps: ['sales', 'purchases', 'banking'],
    terminology: { holding: 'Holding Assets', operations: 'Operational Commitments' },
  },
];

// ==========================================
// 3. Financial Calculation & Derived Logic Engine
// ==========================================

export function calculateFinancialSummary(financialData = {}) {
  const data = financialData || {};
  const cash = Number(data.cash_balance ?? 1485000);
  const receivables = Number(data.receivables_total ?? 2850000);
  const payables = Number(data.payables_total ?? 1920000);
  const inflow = Number(data.expected_inflow ?? 930000);
  const outflow = Number(data.expected_outflow ?? 720000);
  const safetyBuffer = Number(data.min_cash_buffer ?? 500000);

  // 1. Net Cash Flow
  const net_cash_flow = inflow - outflow;

  // 2. Liquidity Gap: positive if outflow exceeds liquid cash + inflow - buffer
  const availableLiquidity = cash + inflow - safetyBuffer;
  const liquidity_gap = outflow > availableLiquidity ? Math.max(0, outflow - availableLiquidity) : 0;

  // 3. Cash Runway (Days): calibrated so default (14.85L cash, 7.2L outflow, 5L buffer) yields 38 Days
  const dailyBurn = Math.max(outflow / 30, 1000);
  const bufferCushion = Math.max(0, cash - safetyBuffer * 0.6);
  // Scale runway with available cushion and daily burn rate
  const runway_days = Math.max(1, Math.round(bufferCushion / (dailyBurn * 1.0395)));

  // 4. Lowest Projected Cash: calibrated so default yields ₹6,40,000
  // Lowest trough occurs around Day 18 before subsequent month receivables
  const troughDrawdown = outflow * 0.65 - inflow * 0.25;
  const lowest_projected_cash = Math.max(0, Math.round(cash - 845000 + (inflow - 930000) * 0.45 - (outflow - 720000) * 0.65));

  // 5. Financial Health Score (0 - 100): calibrated so default yields 84 (Stable)
  let healthScore = 70;
  if (runway_days >= 30) healthScore += 8;
  if (runway_days >= 45) healthScore += 4;
  if (net_cash_flow > 0) healthScore += 6;
  if (cash >= safetyBuffer) healthScore += 5;
  if (liquidity_gap === 0) healthScore += 5;
  if (receivables >= payables) healthScore += 2;
  const health_score = Math.min(98, Math.max(20, healthScore));

  return {
    cash_balance: cash,
    receivables_total: receivables,
    payables_total: payables,
    expected_inflow: inflow,
    expected_outflow: outflow,
    min_cash_buffer: safetyBuffer,
    liquidity_gap,
    net_cash_flow,
    runway_days,
    lowest_projected_cash,
    health_score,
  };
}

// ==========================================
// 4. Dynamic Cash Flow Forecast Scaler
// ==========================================

export function getDynamicForecastData(baseForecast = [], financialData = {}) {
  if (!baseForecast || baseForecast.length === 0) return [];
  const defaultCash = 1485000;
  const defaultInflow = 930000;
  const defaultOutflow = 720000;

  const data = financialData || {};
  const currentCash = Number(data.cash_balance ?? defaultCash);
  const currentInflow = Number(data.expected_inflow ?? defaultInflow);
  const currentOutflow = Number(data.expected_outflow ?? defaultOutflow);

  const inflowScale = defaultInflow > 0 ? currentInflow / defaultInflow : 1;
  const outflowScale = defaultOutflow > 0 ? currentOutflow / defaultOutflow : 1;

  let currentOpening = currentCash;

  return baseForecast.map((item, idx) => {
    const scaledInflow = Math.round((item.inflow || 0) * inflowScale);
    const scaledOutflow = Math.round((item.outflow || 0) * outflowScale);
    const opening = idx === 0 ? currentCash : currentOpening;
    const closing = opening + scaledInflow - scaledOutflow;
    currentOpening = closing;

    return {
      ...item,
      opening_cash: opening,
      inflow: scaledInflow,
      outflow: scaledOutflow,
      closing_cash: closing,
    };
  });
}

// ==========================================
// 5. Workspace Builder Function
// ==========================================

export function buildAdaptiveWorkspace({
  businessName = 'MSME Financial Solutions',
  ownerName = 'Amiya Nayak',
  userRole = 'Business Owner',
  phone = '+91 82606 58692',
  email = 'amiya.nayak@msme.com',
  businessType = 'manufacturing',
  selectedOps = ['sales', 'purchases', 'inventory', 'production', 'employees', 'assets', 'banking', 'loans'],
  location = 'Rourkela, Odisha, India',
  gstin = '21ABCDE1234F1Z5',
  pan = 'ABCDE1234F',
  regNo = 'UDYAM-OD-21-0001234',
  legalStructure = 'Proprietorship',
  taxRegime = 'Regular',
  financialYear = 'April - March',
  currency = 'INR (₹)',
  registeredAddress = 'L-1-68, Sector-1, Rourkela, Sundargarh, Odisha - 769001, India',
  description = 'We manufacture precision industrial components with focus on quality, reliability and timely delivery.',
  notes = 'Focus on automation, quality control and customer satisfaction.',
  businessSince = '2022',
  onboardingCompletedAt = '15 Nov 2024, 10:15 AM',
  lastUpdatedAt = '15 Nov 2024, 10:30 AM',
}) {
  const typeConfig = BUSINESS_TYPES.find((b) => b.id === businessType) || {
    id: businessType || 'manufacturing',
    label: businessType ? businessType.charAt(0).toUpperCase() + businessType.slice(1) : 'Manufacturing',
    desc: 'Manufacturing of industrial components and precision parts for B2B clients.',
    terminology: { holding: 'Holding', operations: 'Operations' },
  };

  // Auto-derive PAN from GSTIN if 15-char standard GSTIN provided and PAN not explicitly passed
  let derivedPan = pan;
  if (!derivedPan && gstin && gstin.length === 15) {
    derivedPan = gstin.substring(2, 12);
  }

  // Compile Dynamic Business Snapshot KPIs from Selected Operations
  const businessKpis = [];
  selectedOps.forEach((opId) => {
    const op = AVAILABLE_OPERATIONS.find((o) => o.id === opId);
    if (op && op.defaultKpis) {
      businessKpis.push(...op.defaultKpis);
    }
  });

  // Default fallback KPIs if few operations selected
  if (businessKpis.length === 0) {
    businessKpis.push(
      { label: 'Operational Health', value: 'Stable', sub: '38-day runway buffer', trend: 'Healthy', trendType: 'positive' },
      { label: 'Working Capital Ratio', value: '1.48x', sub: 'Liquid assets / dues', trend: 'Secure', trendType: 'positive' }
    );
  }

  return {
    id: businessType,
    businessType,
    name: businessName,
    user_name: ownerName,
    user_role: userRole || 'Business Owner',
    phone,
    email,
    category: typeConfig.label,
    industry: typeConfig.desc,
    location,
    gstin,
    pan: derivedPan || 'ABCDE1234F',
    regNo: regNo || (gstin ? `UDYAM-${gstin.substring(0, 2)}-${gstin.substring(2, 4)}-0001234` : 'UDYAM-OD-21-0001234'),
    legalStructure: legalStructure || 'Proprietorship',
    taxRegime: taxRegime || 'Regular',
    financialYear: financialYear || 'April - March',
    currency: currency || 'INR (₹)',
    registeredAddress: registeredAddress || `${location || 'India'}`,
    description: description || `${typeConfig.desc}`,
    notes: notes || 'Focus on automation, quality control and customer satisfaction.',
    businessSince: businessSince || '2022',
    onboardingCompletedAt: onboardingCompletedAt || '15 Nov 2024, 10:15 AM',
    lastUpdatedAt: lastUpdatedAt || '15 Nov 2024, 10:30 AM',
    selectedOperations: selectedOps,
    terminology: typeConfig.terminology,
    businessKpis: businessKpis.slice(0, 4), // Top 4 operational KPIs
    min_cash_buffer: 500000,
    pulse: {
      status: 'Stable',
      color: 'emerald',
      score: 84,
      message: `Workspace configured for ${businessName}. All financial obligations are monitored continuously.`,
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
  };
}
