import { formatINR } from '../mocks/dashboardMockData.js';

/**
 * VITTANAYA — Default Operations Configuration & Metadata
 * Provides standard starting baseline values and summary generators for all 13 operations.
 */
export const DEFAULT_OPERATIONS_CONFIG = {
  sales: {
    activeCustomers: 142,
    monthlySales: 1250000,
    avgInvoiceValue: 88000,
    avgCollectionPeriod: 34,
    outstandingReceivables: 2850000,
    overdueReceivables: 420000,
  },
  purchases: {
    activeSuppliers: 38,
    monthlyPurchases: 720000,
    outstandingPayables: 1920000,
    avgSupplierPaymentPeriod: 42,
    overduePayables: 180000,
    upcomingPaymentObligations: 350000,
  },
  inventory: {
    totalInventoryValue: 850000,
    skuCount: 1240,
    avgStockLevel: '85% of optimal',
    lowStockThreshold: 150,
    warehouseCount: 2,
    monthlyInventoryMovement: '₹4,80,000 / month',
  },
  production: {
    monthlyCapacity: '50,000 units',
    currentMonthlyProduction: '42,500 units',
    activeProductionOrders: 18,
    rawMaterialCost: 380000,
    avgProductionCost: '₹68 / unit',
    utilizationPercent: 85,
  },
  employees: {
    totalEmployees: 24,
    fullTimeEmployees: 18,
    contractEmployees: 6,
    monthlyPayroll: 480000,
    avgSalary: 20000,
    nextPayrollDate: '01 Sep 2026',
  },
  assets: {
    assetCount: 14,
    totalAssetValue: 3200000,
    monthlyDepreciation: 35000,
    monthlyMaintenanceCost: 28000,
    nextMajorMaintenanceDate: '15 Oct 2026',
  },
  projects: {
    activeProjects: 6,
    totalContractValue: 4500000,
    unbilledAmount: 820000,
    monthlyProjectCost: 540000,
    expectedCompletion: 'Nov 2026',
    avgProjectMargin: 22,
  },
  fleet: {
    totalVehicles: 12,
    cars: 2,
    trucks: 8,
    buses: 0,
    otherVehicles: 2,
    avgTripsPerMonth: 420,
    avgDistancePerTrip: '145 km',
    fleetUtilization: 82,
    activeDrivers: 14,
    avgFuelCostPerMonth: 185000,
    avgFuelPrice: '₹96.50 / L',
    avgFuelConsumption: '1,920 L',
    monthlyMaintenanceCost: 45000,
    nextMaintenanceDue: '28 Sep 2026',
    insurancePermitCost: 38000,
    vehicleLoans: 4,
    outstandingLoanAmount: 1650000,
    monthlyEmi: 80000,
  },
  loans: {
    activeLoans: 2,
    outstandingPrincipal: 1250000,
    monthlyEmi: 80000,
    interestRate: '9.25% p.a.',
    nextPaymentDate: '05 Sep 2026',
    creditFacilityLimit: 2500000,
  },
  banking: {
    bankAccountsCount: 3,
    totalBankBalance: 1485000,
    monthlyBankInflow: 930000,
    monthlyBankOutflow: 720000,
    reconciliationStatus: 'Reconciled (up to yesterday)',
  },
  fuel: {
    monthlyFuelExpense: 185000,
    monthlyOperatingExpenses: 340000,
    avgExpensePerTrip: 440,
    tollExpense: 32000,
    otherRecurringExpenses: 65000,
  },
  maintenance: {
    monthlyMaintenanceCost: 52000,
    activeMaintenanceJobs: 3,
    avgRepairCost: 14500,
    nextMaintenanceDue: '12 Sep 2026',
    maintenanceReserve: 150000,
  },
  other: {
    customOpName: 'Custom Operations',
    description: 'General operational commitments and miscellaneous services',
    monthlyValueCost: 50000,
    notes: 'Configured for specialized workflow management.',
  },
};

/**
 * Returns 1 or 2 compact summary metric badges to display on an active operation card
 */
export function getOperationSummaryBadges(opId, config = {}) {
  const c = { ...(DEFAULT_OPERATIONS_CONFIG[opId] || {}), ...(config || {}) };

  switch (opId) {
    case 'sales':
      return [
        `${formatINR(c.monthlySales || 1250000)} / Mo`,
        `${c.activeCustomers || 142} Customers`,
      ];
    case 'purchases':
      return [
        `${formatINR(c.monthlyPurchases || 720000)} / Mo`,
        `${c.activeSuppliers || 38} Suppliers`,
      ];
    case 'inventory':
      return [
        `${formatINR(c.totalInventoryValue || 850000)} Value`,
        `${c.skuCount || 1240} Items`,
      ];
    case 'production':
      return [
        `${c.utilizationPercent || 85}% Utilization`,
        `${c.currentMonthlyProduction || '42,500 units'}`,
      ];
    case 'employees':
      return [
        `${c.totalEmployees || 24} Employees`,
        `${formatINR(c.monthlyPayroll || 480000)} / Mo`,
      ];
    case 'assets':
      return [
        `${c.assetCount || 14} Assets`,
        `${formatINR(c.totalAssetValue || 3200000)} Value`,
      ];
    case 'projects':
      return [
        `${c.activeProjects || 6} Active Projects`,
        `${c.avgProjectMargin || 22}% Margin`,
      ];
    case 'fleet':
      return [
        `${c.fleetUtilization || 82}% Utilization`,
        `${formatINR(c.avgFuelCostPerMonth || 185000)} Fuel / Mo`,
      ];
    case 'loans':
      return [
        `${formatINR(c.outstandingPrincipal || 1250000)} Outstanding`,
        `${formatINR(c.monthlyEmi || 80000)} EMI / Mo`,
      ];
    case 'banking':
      return [
        `${c.bankAccountsCount || 3} Accounts`,
        `${formatINR(c.totalBankBalance || 1485000)} Balance`,
      ];
    case 'fuel':
      return [
        `${formatINR(c.monthlyOperatingExpenses || 340000)} / Mo`,
        `${formatINR(c.monthlyFuelExpense || 185000)} Fuel`,
      ];
    case 'maintenance':
      return [
        `${formatINR(c.monthlyMaintenanceCost || 52000)} / Mo`,
        `${c.activeMaintenanceJobs || 3} Active Jobs`,
      ];
    case 'other':
      return [
        c.customOpName || 'Custom Operations',
        `${formatINR(c.monthlyValueCost || 50000)} / Mo`,
      ];
    default:
      return ['Configured', 'Active'];
  }
}
