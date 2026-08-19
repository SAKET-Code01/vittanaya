import { formatINR } from '../mocks/dashboardMockData.js';

/**
 * VITTANAYA — Cash Overview Mock Data & Generator
 * 
 * Provides synchronized data structures for:
 * - Cash accounts
 * - Cash movement horizons (7D, 30D, 90D, 1Y)
 * - Transactions
 * - Cash breakdown composition
 * - Optimization suggestions
 */

export const DEFAULT_CASH_ACCOUNTS = [
  {
    id: 'hdfc-4502',
    name: 'HDFC Bank - 4502',
    accountNumber: '•••• 4502',
    type: 'Savings Account',
    bankName: 'HDFC Bank',
    balance: 680000,
    inflow: 1820000,
    outflow: 1140000,
    lastUpdated: 'Updated 10 mins ago',
    iconColor: 'blue',
  },
  {
    id: 'icici-7821',
    name: 'ICICI Bank - 7821',
    accountNumber: '•••• 7821',
    type: 'Current Account',
    bankName: 'ICICI Bank',
    balance: 445000,
    inflow: 950000,
    outflow: 620000,
    lastUpdated: 'Updated 20 mins ago',
    iconColor: 'orange',
  },
  {
    id: 'cash-on-hand',
    name: 'Cash on Hand',
    accountNumber: 'Physical Vault',
    type: 'Physical Cash',
    bankName: 'Cash on Hand',
    balance: 135000,
    inflow: 80000,
    outflow: 40000,
    lastUpdated: 'Updated just now',
    iconColor: 'emerald',
  },
];

export const DEFAULT_TRANSACTIONS = [
  {
    id: 'tx-001',
    date: '19 Aug 2026, 10:15 AM',
    rawDate: '2026-08-19',
    description: 'Payment received from ABC Pvt. Ltd.',
    category: 'Sales',
    categoryColor: 'emerald',
    type: 'inflow',
    typeLabel: 'Inflow',
    amount: 285000,
    balanceAfter: 1485000,
    account: 'HDFC Bank - 4502',
  },
  {
    id: 'tx-002',
    date: '19 Aug 2026, 09:45 AM',
    rawDate: '2026-08-19',
    description: 'Fuel expense - Vehicle OD-02-AX-1234',
    category: 'Fuel',
    categoryColor: 'amber',
    type: 'outflow',
    typeLabel: 'Outflow',
    amount: -18500,
    balanceAfter: 1200000,
    account: 'Cash on Hand',
  },
  {
    id: 'tx-003',
    date: '18 Aug 2026, 06:30 PM',
    rawDate: '2026-08-18',
    description: 'Supplier payment to Steel Works',
    category: 'Purchases',
    categoryColor: 'blue',
    type: 'outflow',
    typeLabel: 'Outflow',
    amount: -95000,
    balanceAfter: 1218500,
    account: 'ICICI Bank - 7821',
  },
  {
    id: 'tx-004',
    date: '18 Aug 2026, 03:20 PM',
    rawDate: '2026-08-18',
    description: 'Bank interest credit - HDFC',
    category: 'Interest',
    categoryColor: 'purple',
    type: 'inflow',
    typeLabel: 'Inflow',
    amount: 5250,
    balanceAfter: 1313500,
    account: 'HDFC Bank - 4502',
  },
  {
    id: 'tx-005',
    date: '18 Aug 2026, 11:05 AM',
    rawDate: '2026-08-18',
    description: 'Toll charges - Kolkata trip',
    category: 'Travel',
    categoryColor: 'amber',
    type: 'outflow',
    typeLabel: 'Outflow',
    amount: -2450,
    balanceAfter: 1308250,
    account: 'Cash on Hand',
  },
  {
    id: 'tx-006',
    date: '17 Aug 2026, 04:15 PM',
    rawDate: '2026-08-17',
    description: 'Advance received - Project Beta',
    category: 'Sales',
    categoryColor: 'emerald',
    type: 'inflow',
    typeLabel: 'Inflow',
    amount: 150000,
    balanceAfter: 1310700,
    account: 'HDFC Bank - 4502',
  },
  {
    id: 'tx-007',
    date: '16 Aug 2026, 02:30 PM',
    rawDate: '2026-08-16',
    description: 'Factory Utility & Power Bill',
    category: 'Utilities',
    categoryColor: 'blue',
    type: 'outflow',
    typeLabel: 'Outflow',
    amount: -42000,
    balanceAfter: 1160700,
    account: 'ICICI Bank - 7821',
  },
];

// Cash Movement Datasets for 7D, 30D, 90D, 1Y
export const CASH_MOVEMENT_DATA = {
  '7D': [
    { label: '13 Aug', inflow: 45000, outflow: -20000, net: 25000 },
    { label: '14 Aug', inflow: 85000, outflow: -35000, net: 50000 },
    { label: '15 Aug', inflow: 30000, outflow: -15000, net: 15000 },
    { label: '16 Aug', inflow: 150000, outflow: -42000, net: 108000 },
    { label: '17 Aug', inflow: 75000, outflow: -30000, net: 45000 },
    { label: '18 Aug', inflow: 5250, outflow: -97450, net: -92200 },
    { label: '19 Aug', inflow: 285000, outflow: -18500, net: 266500 },
  ],
  '30D': [
    { label: '19 Jul', inflow: 220000, outflow: -180000, net: 40000 },
    { label: '22 Jul', inflow: 410000, outflow: -290000, net: 120000 },
    { label: '26 Jul', inflow: 680000, outflow: -450000, net: 230000 },
    { label: '29 Jul', inflow: 350000, outflow: -520000, net: -170000 },
    { label: '2 Aug', inflow: 890000, outflow: -610000, net: 280000 },
    { label: '5 Aug', inflow: 510000, outflow: -380000, net: 130000 },
    { label: '9 Aug', inflow: 720000, outflow: -650000, net: 70000 },
    { label: '12 Aug', inflow: 430000, outflow: -310000, net: 120000 },
    { label: '16 Aug', inflow: 950000, outflow: -780000, net: 170000 },
    { label: '19 Aug', inflow: 850000, outflow: -620000, net: 230000 },
  ],
  '90D': [
    { label: 'Jun W1', inflow: 1200000, outflow: -950000, net: 250000 },
    { label: 'Jun W3', inflow: 1450000, outflow: -1100000, net: 350000 },
    { label: 'Jul W1', inflow: 1100000, outflow: -1300000, net: -200000 },
    { label: 'Jul W3', inflow: 1650000, outflow: -1250000, net: 400000 },
    { label: 'Aug W1', inflow: 1800000, outflow: -1400000, net: 400000 },
    { label: 'Aug W3', inflow: 1950000, outflow: -1500000, net: 450000 },
  ],
  '1Y': [
    { label: 'Q3 25', inflow: 4200000, outflow: -3600000, net: 600000 },
    { label: 'Q4 25', inflow: 5100000, outflow: -4100000, net: 1000000 },
    { label: 'Q1 26', inflow: 4800000, outflow: -4400000, net: 400000 },
    { label: 'Q2 26', inflow: 5900000, outflow: -4700000, net: 1200000 },
  ],
};

export const CASH_OPTIMIZATION_SUGGESTIONS = [
  {
    id: 'sug-1',
    title: 'Incentivize Early Customer Receivables',
    impact: '+₹1,17,600 Cash Inflow Acceleration',
    description: 'Offering a 2% early cash settlement discount to Acme Global Industries (INV-101) can accelerate ₹2.5L receivables realization by 20 days.',
    category: 'Receivables Optimization',
    priority: 'High',
  },
  {
    id: 'sug-2',
    title: 'Stagger Supplier Month-End Batch Settlements',
    impact: 'Preserves +₹1.4L Buffer Floor',
    description: 'Negotiate split payment terms with SAIL Steel Scrap Syndicate across 15-day intervals rather than single lump sum on Aug 29.',
    category: 'Payables Management',
    priority: 'Medium',
  },
  {
    id: 'sug-3',
    title: 'Sweep Excess Current Account Funds to Auto-FD',
    impact: 'Generates ~₹18,500 Annual Interest',
    description: 'Set up auto-sweep on HDFC Bank balance exceeding ₹3,00,000 to earn overnight flexi-deposit interest without sacrificing instant liquidity.',
    category: 'Yield & Banking',
    priority: 'Low',
  },
];
