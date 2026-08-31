import React, { useState, useEffect } from 'react';
import { AVAILABLE_OPERATIONS } from '../../data/adaptiveWorkspaceConfig';
import { DEFAULT_OPERATIONS_CONFIG } from '../../data/defaultOperationsConfig';
import { formatINR } from '../../mocks/dashboardMockData';

/**
 * OperationConfigModal Component — 100% STRICT APPROVED REFERENCE STYLING
 * 
 * Provides dedicated, tailored configuration forms for all 13 MSME operations.
 * Supports:
 * - Dynamic custom values for every field
 * - Live formatted INR indicators
 * - Safe Deactivation with confirmation and preserved settings
 * - Save & Cancel handlers
 */
export default function OperationConfigModal({
  isOpen,
  onClose,
  opId,
  currentProfile,
  operationsConfig = {},
  onSaveConfig,
  onDeactivate,
}) {
  const opMeta = AVAILABLE_OPERATIONS.find((o) => o.id === opId) || {
    id: opId || 'sales',
    label: 'Operation Details',
    desc: 'Configure operation parameters',
    category: 'Operations',
  };

  const isActive = (currentProfile?.selectedOperations || []).includes(opId);

  // Form State initialized from saved configuration or defaults
  const [formData, setFormData] = useState({});
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);

  useEffect(() => {
    if (opId) {
      const savedConfig = operationsConfig[opId] || DEFAULT_OPERATIONS_CONFIG[opId] || {};
      setFormData({ ...savedConfig });
      setShowDeactivateConfirm(false);
    }
  }, [opId, operationsConfig, isOpen]);

  if (!isOpen || !opId) return null;

  const handleChange = (key, val) => {
    setFormData((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (onSaveConfig) {
      onSaveConfig(opId, formData);
    }
    onClose();
  };

  const handleConfirmDeactivate = () => {
    if (onDeactivate) {
      onDeactivate(opId);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-900 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                {opMeta.label}
              </h3>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {isActive ? 'Active' : 'Available'}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                {opMeta.category}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {opMeta.desc}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Deactivation Confirmation Warning Strip */}
        {showDeactivateConfirm && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2.5 animate-fadeIn flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-rose-600 font-bold">⚠️</span>
              <h4 className="text-xs font-bold text-rose-900">
                Deactivate {opMeta.label}?
              </h4>
            </div>
            <p className="text-xs text-rose-700 leading-relaxed">
              This will remove <strong>{opMeta.label}</strong> from your active operations list. Your entered parameters will remain saved so you can re-enable this operation anytime.
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowDeactivateConfirm(false)}
                className="px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-100/50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeactivate}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
              >
                Confirm Deactivation
              </button>
            </div>
          </div>
        )}

        {/* Form Body (Scrollable) */}
        <form id="op-config-form" onSubmit={handleSave} className="flex-1 overflow-y-auto space-y-5 pr-1 text-xs">

          {/* 1. SALES / RECEIVABLES */}
          {opId === 'sales' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Number of Active Customers</label>
                  <input
                    type="number"
                    value={formData.activeCustomers ?? 142}
                    onChange={(e) => handleChange('activeCustomers', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                    placeholder="e.g. 142"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Monthly Sales (₹)</label>
                  <input
                    type="number"
                    value={formData.monthlySales ?? 1250000}
                    onChange={(e) => handleChange('monthlySales', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                    placeholder="e.g. 1250000"
                  />
                  <span className="text-[10px] text-slate-500">{formatINR(Number(formData.monthlySales || 0))}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Average Invoice Value (₹)</label>
                  <input
                    type="number"
                    value={formData.avgInvoiceValue ?? 88000}
                    onChange={(e) => handleChange('avgInvoiceValue', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                    placeholder="e.g. 88000"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Average Collection Period (Days)</label>
                  <input
                    type="number"
                    value={formData.avgCollectionPeriod ?? 34}
                    onChange={(e) => handleChange('avgCollectionPeriod', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                    placeholder="e.g. 34"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Outstanding Receivables (₹)</label>
                  <input
                    type="number"
                    value={formData.outstandingReceivables ?? 2850000}
                    onChange={(e) => handleChange('outstandingReceivables', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                  <span className="text-[10px] text-slate-500">{formatINR(Number(formData.outstandingReceivables || 0))}</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Overdue Receivables (₹)</label>
                  <input
                    type="number"
                    value={formData.overdueReceivables ?? 420000}
                    onChange={(e) => handleChange('overdueReceivables', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                  <span className="text-[10px] text-rose-500 font-semibold">{formatINR(Number(formData.overdueReceivables || 0))}</span>
                </div>
              </div>
            </div>
          )}

          {/* 2. PURCHASES / PAYABLES */}
          {opId === 'purchases' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Number of Active Suppliers</label>
                  <input
                    type="number"
                    value={formData.activeSuppliers ?? 38}
                    onChange={(e) => handleChange('activeSuppliers', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Monthly Purchases (₹)</label>
                  <input
                    type="number"
                    value={formData.monthlyPurchases ?? 720000}
                    onChange={(e) => handleChange('monthlyPurchases', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                  <span className="text-[10px] text-slate-500">{formatINR(Number(formData.monthlyPurchases || 0))}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Outstanding Payables (₹)</label>
                  <input
                    type="number"
                    value={formData.outstandingPayables ?? 1920000}
                    onChange={(e) => handleChange('outstandingPayables', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                  <span className="text-[10px] text-slate-500">{formatINR(Number(formData.outstandingPayables || 0))}</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Average Payment Period (Days)</label>
                  <input
                    type="number"
                    value={formData.avgSupplierPaymentPeriod ?? 42}
                    onChange={(e) => handleChange('avgSupplierPaymentPeriod', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Overdue Payables (₹)</label>
                  <input
                    type="number"
                    value={formData.overduePayables ?? 180000}
                    onChange={(e) => handleChange('overduePayables', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                  <span className="text-[10px] text-rose-500 font-semibold">{formatINR(Number(formData.overduePayables || 0))}</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Upcoming Payment Obligations (₹)</label>
                  <input
                    type="number"
                    value={formData.upcomingPaymentObligations ?? 350000}
                    onChange={(e) => handleChange('upcomingPaymentObligations', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. INVENTORY / STOCK */}
          {opId === 'inventory' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Total Inventory Value (₹)</label>
                  <input
                    type="number"
                    value={formData.totalInventoryValue ?? 850000}
                    onChange={(e) => handleChange('totalInventoryValue', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                  <span className="text-[10px] text-slate-500">{formatINR(Number(formData.totalInventoryValue || 0))}</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Number of SKUs / Items</label>
                  <input
                    type="number"
                    value={formData.skuCount ?? 1240}
                    onChange={(e) => handleChange('skuCount', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Average Stock Level</label>
                  <input
                    type="text"
                    value={formData.avgStockLevel ?? '85% of optimal'}
                    onChange={(e) => handleChange('avgStockLevel', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Low-Stock Threshold (Units)</label>
                  <input
                    type="number"
                    value={formData.lowStockThreshold ?? 150}
                    onChange={(e) => handleChange('lowStockThreshold', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Warehouse / Location Count</label>
                  <input
                    type="number"
                    value={formData.warehouseCount ?? 2}
                    onChange={(e) => handleChange('warehouseCount', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Monthly Inventory Movement</label>
                  <input
                    type="text"
                    value={formData.monthlyInventoryMovement ?? '₹4,80,000 / month'}
                    onChange={(e) => handleChange('monthlyInventoryMovement', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. PRODUCTION / MANUFACTURING */}
          {opId === 'production' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Monthly Production Capacity</label>
                  <input
                    type="text"
                    value={formData.monthlyCapacity ?? '50,000 units'}
                    onChange={(e) => handleChange('monthlyCapacity', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Current Monthly Production</label>
                  <input
                    type="text"
                    value={formData.currentMonthlyProduction ?? '42,500 units'}
                    onChange={(e) => handleChange('currentMonthlyProduction', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Active Production Orders</label>
                  <input
                    type="number"
                    value={formData.activeProductionOrders ?? 18}
                    onChange={(e) => handleChange('activeProductionOrders', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Production Utilization %</label>
                  <input
                    type="number"
                    value={formData.utilizationPercent ?? 85}
                    onChange={(e) => handleChange('utilizationPercent', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Raw Material Cost (₹)</label>
                  <input
                    type="number"
                    value={formData.rawMaterialCost ?? 380000}
                    onChange={(e) => handleChange('rawMaterialCost', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                  <span className="text-[10px] text-slate-500">{formatINR(Number(formData.rawMaterialCost || 0))}</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Average Production Cost</label>
                  <input
                    type="text"
                    value={formData.avgProductionCost ?? '₹68 / unit'}
                    onChange={(e) => handleChange('avgProductionCost', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 5. EMPLOYEES / PAYROLL */}
          {opId === 'employees' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Total Employees</label>
                  <input
                    type="number"
                    value={formData.totalEmployees ?? 24}
                    onChange={(e) => handleChange('totalEmployees', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Full-time</label>
                  <input
                    type="number"
                    value={formData.fullTimeEmployees ?? 18}
                    onChange={(e) => handleChange('fullTimeEmployees', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Contract</label>
                  <input
                    type="number"
                    value={formData.contractEmployees ?? 6}
                    onChange={(e) => handleChange('contractEmployees', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Monthly Payroll (₹)</label>
                  <input
                    type="number"
                    value={formData.monthlyPayroll ?? 480000}
                    onChange={(e) => handleChange('monthlyPayroll', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                  <span className="text-[10px] text-slate-500">{formatINR(Number(formData.monthlyPayroll || 0))}</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Average Salary (₹)</label>
                  <input
                    type="number"
                    value={formData.avgSalary ?? 20000}
                    onChange={(e) => handleChange('avgSalary', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Next Payroll Due Date</label>
                <input
                  type="text"
                  value={formData.nextPayrollDate ?? '01 Sep 2026'}
                  onChange={(e) => handleChange('nextPayrollDate', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                />
              </div>
            </div>
          )}

          {/* 6. ASSETS / EQUIPMENT */}
          {opId === 'assets' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Number of Assets / Equipment</label>
                  <input
                    type="number"
                    value={formData.assetCount ?? 14}
                    onChange={(e) => handleChange('assetCount', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Total Asset Value (₹)</label>
                  <input
                    type="number"
                    value={formData.totalAssetValue ?? 3200000}
                    onChange={(e) => handleChange('totalAssetValue', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                  <span className="text-[10px] text-slate-500">{formatINR(Number(formData.totalAssetValue || 0))}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Monthly Depreciation (₹)</label>
                  <input
                    type="number"
                    value={formData.monthlyDepreciation ?? 35000}
                    onChange={(e) => handleChange('monthlyDepreciation', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Monthly Maintenance Cost (₹)</label>
                  <input
                    type="number"
                    value={formData.monthlyMaintenanceCost ?? 28000}
                    onChange={(e) => handleChange('monthlyMaintenanceCost', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Next Major Maintenance Date</label>
                <input
                  type="text"
                  value={formData.nextMajorMaintenanceDate ?? '15 Oct 2026'}
                  onChange={(e) => handleChange('nextMajorMaintenanceDate', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                />
              </div>
            </div>
          )}

          {/* 7. PROJECTS / CONTRACTS */}
          {opId === 'projects' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Active Projects Count</label>
                  <input
                    type="number"
                    value={formData.activeProjects ?? 6}
                    onChange={(e) => handleChange('activeProjects', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Total Contract Value (₹)</label>
                  <input
                    type="number"
                    value={formData.totalContractValue ?? 4500000}
                    onChange={(e) => handleChange('totalContractValue', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                  <span className="text-[10px] text-slate-500">{formatINR(Number(formData.totalContractValue || 0))}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Unbilled Milestone WIP (₹)</label>
                  <input
                    type="number"
                    value={formData.unbilledAmount ?? 820000}
                    onChange={(e) => handleChange('unbilledAmount', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Monthly Project Cost (₹)</label>
                  <input
                    type="number"
                    value={formData.monthlyProjectCost ?? 540000}
                    onChange={(e) => handleChange('monthlyProjectCost', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Expected Milestone Completion</label>
                  <input
                    type="text"
                    value={formData.expectedCompletion ?? 'Nov 2026'}
                    onChange={(e) => handleChange('expectedCompletion', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Average Project Margin %</label>
                  <input
                    type="number"
                    value={formData.avgProjectMargin ?? 22}
                    onChange={(e) => handleChange('avgProjectMargin', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 8. FLEET / TRIPS (Rich multi-section configuration matching user specification) */}
          {opId === 'fleet' && (
            <div className="space-y-5">
              {/* Section 1: Fleet Vehicles Breakdown */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="font-extrabold text-slate-800 tracking-wide uppercase text-[11px] block">
                  🚛 1. Fleet Vehicle Inventory
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Total Vehicles</label>
                    <input
                      type="number"
                      value={formData.totalVehicles ?? 12}
                      onChange={(e) => handleChange('totalVehicles', Number(e.target.value))}
                      className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-200 font-bold text-xs outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Cars</label>
                    <input
                      type="number"
                      value={formData.cars ?? 2}
                      onChange={(e) => handleChange('cars', Number(e.target.value))}
                      className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-200 font-bold text-xs outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Trucks</label>
                    <input
                      type="number"
                      value={formData.trucks ?? 8}
                      onChange={(e) => handleChange('trucks', Number(e.target.value))}
                      className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-200 font-bold text-xs outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Buses</label>
                    <input
                      type="number"
                      value={formData.buses ?? 0}
                      onChange={(e) => handleChange('buses', Number(e.target.value))}
                      className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-200 font-bold text-xs outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Other</label>
                    <input
                      type="number"
                      value={formData.otherVehicles ?? 2}
                      onChange={(e) => handleChange('otherVehicles', Number(e.target.value))}
                      className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-200 font-bold text-xs outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Fleet Operations */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="font-extrabold text-slate-800 tracking-wide uppercase text-[11px] block">
                  ⚙️ 2. Trips & Utilization
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Trips / Month</label>
                    <input
                      type="number"
                      value={formData.avgTripsPerMonth ?? 420}
                      onChange={(e) => handleChange('avgTripsPerMonth', Number(e.target.value))}
                      className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-200 font-bold text-xs outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Avg Distance / Trip</label>
                    <input
                      type="text"
                      value={formData.avgDistancePerTrip ?? '145 km'}
                      onChange={(e) => handleChange('avgDistancePerTrip', e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-200 font-bold text-xs outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Fleet Utilization %</label>
                    <input
                      type="number"
                      value={formData.fleetUtilization ?? 82}
                      onChange={(e) => handleChange('fleetUtilization', Number(e.target.value))}
                      className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-200 font-bold text-xs outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Active Drivers</label>
                    <input
                      type="number"
                      value={formData.activeDrivers ?? 14}
                      onChange={(e) => handleChange('activeDrivers', Number(e.target.value))}
                      className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-200 font-bold text-xs outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Fuel */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="font-extrabold text-slate-800 tracking-wide uppercase text-[11px] block">
                  ⛽ 3. Fuel & Consumption
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Fuel Cost / Month (₹)</label>
                    <input
                      type="number"
                      value={formData.avgFuelCostPerMonth ?? 185000}
                      onChange={(e) => handleChange('avgFuelCostPerMonth', Number(e.target.value))}
                      className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-200 font-bold text-xs outline-none focus:border-emerald-500"
                    />
                    <span className="text-[10px] text-slate-500">{formatINR(Number(formData.avgFuelCostPerMonth || 0))}</span>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Avg Fuel Price</label>
                    <input
                      type="text"
                      value={formData.avgFuelPrice ?? '₹96.50 / L'}
                      onChange={(e) => handleChange('avgFuelPrice', e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-200 font-bold text-xs outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Monthly Consumption</label>
                    <input
                      type="text"
                      value={formData.avgFuelConsumption ?? '1,920 L'}
                      onChange={(e) => handleChange('avgFuelConsumption', e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-200 font-bold text-xs outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Maintenance & Finance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <span className="font-extrabold text-slate-800 tracking-wide uppercase text-[11px] block">
                    🔧 4. Maintenance
                  </span>
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600">Monthly Maintenance (₹)</label>
                      <input
                        type="number"
                        value={formData.monthlyMaintenanceCost ?? 45000}
                        onChange={(e) => handleChange('monthlyMaintenanceCost', Number(e.target.value))}
                        className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-200 font-bold text-xs outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600">Next Maintenance Due</label>
                      <input
                        type="text"
                        value={formData.nextMaintenanceDue ?? '28 Sep 2026'}
                        onChange={(e) => handleChange('nextMaintenanceDue', e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-200 font-bold text-xs outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <span className="font-extrabold text-slate-800 tracking-wide uppercase text-[11px] block">
                    💳 5. Vehicle Finance & EMI
                  </span>
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600">Monthly EMI (₹)</label>
                      <input
                        type="number"
                        value={formData.monthlyEmi ?? 80000}
                        onChange={(e) => handleChange('monthlyEmi', Number(e.target.value))}
                        className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-200 font-bold text-xs outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600">Outstanding Loan (₹)</label>
                      <input
                        type="number"
                        value={formData.outstandingLoanAmount ?? 1650000}
                        onChange={(e) => handleChange('outstandingLoanAmount', Number(e.target.value))}
                        className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-200 font-bold text-xs outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 9. LOANS / CREDIT */}
          {opId === 'loans' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Number of Active Loans</label>
                  <input
                    type="number"
                    value={formData.activeLoans ?? 2}
                    onChange={(e) => handleChange('activeLoans', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Outstanding Principal (₹)</label>
                  <input
                    type="number"
                    value={formData.outstandingPrincipal ?? 1250000}
                    onChange={(e) => handleChange('outstandingPrincipal', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                  <span className="text-[10px] text-slate-500">{formatINR(Number(formData.outstandingPrincipal || 0))}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Monthly EMI (₹)</label>
                  <input
                    type="number"
                    value={formData.monthlyEmi ?? 80000}
                    onChange={(e) => handleChange('monthlyEmi', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                  <span className="text-[10px] text-slate-500">{formatINR(Number(formData.monthlyEmi || 0))}</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Interest Rate</label>
                  <input
                    type="text"
                    value={formData.interestRate ?? '9.25% p.a.'}
                    onChange={(e) => handleChange('interestRate', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Next EMI Due Date</label>
                  <input
                    type="text"
                    value={formData.nextPaymentDate ?? '05 Sep 2026'}
                    onChange={(e) => handleChange('nextPaymentDate', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Credit Facility Limit (₹)</label>
                  <input
                    type="number"
                    value={formData.creditFacilityLimit ?? 2500000}
                    onChange={(e) => handleChange('creditFacilityLimit', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 10. BANKING / ACCOUNTS */}
          {opId === 'banking' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Number of Bank Accounts</label>
                  <input
                    type="number"
                    value={formData.bankAccountsCount ?? 3}
                    onChange={(e) => handleChange('bankAccountsCount', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Total Bank Balance (₹)</label>
                  <input
                    type="number"
                    value={formData.totalBankBalance ?? 1485000}
                    onChange={(e) => handleChange('totalBankBalance', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                  <span className="text-[10px] text-slate-500">{formatINR(Number(formData.totalBankBalance || 0))}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Monthly Bank Inflow (₹)</label>
                  <input
                    type="number"
                    value={formData.monthlyBankInflow ?? 930000}
                    onChange={(e) => handleChange('monthlyBankInflow', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Monthly Bank Outflow (₹)</label>
                  <input
                    type="number"
                    value={formData.monthlyBankOutflow ?? 720000}
                    onChange={(e) => handleChange('monthlyBankOutflow', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Reconciliation Status</label>
                <input
                  type="text"
                  value={formData.reconciliationStatus ?? 'Reconciled (up to yesterday)'}
                  onChange={(e) => handleChange('reconciliationStatus', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                />
              </div>
            </div>
          )}

          {/* 11. FUEL & EXPENSES */}
          {opId === 'fuel' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Monthly Fuel Expense (₹)</label>
                  <input
                    type="number"
                    value={formData.monthlyFuelExpense ?? 185000}
                    onChange={(e) => handleChange('monthlyFuelExpense', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                  <span className="text-[10px] text-slate-500">{formatINR(Number(formData.monthlyFuelExpense || 0))}</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Monthly Operating Expenses (₹)</label>
                  <input
                    type="number"
                    value={formData.monthlyOperatingExpenses ?? 340000}
                    onChange={(e) => handleChange('monthlyOperatingExpenses', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Avg Expense / Trip (₹)</label>
                  <input
                    type="number"
                    value={formData.avgExpensePerTrip ?? 440}
                    onChange={(e) => handleChange('avgExpensePerTrip', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Toll Expense (₹)</label>
                  <input
                    type="number"
                    value={formData.tollExpense ?? 32000}
                    onChange={(e) => handleChange('tollExpense', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Other Recurring (₹)</label>
                  <input
                    type="number"
                    value={formData.otherRecurringExpenses ?? 65000}
                    onChange={(e) => handleChange('otherRecurringExpenses', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 12. MAINTENANCE & REPAIRS */}
          {opId === 'maintenance' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Monthly Maintenance Cost (₹)</label>
                  <input
                    type="number"
                    value={formData.monthlyMaintenanceCost ?? 52000}
                    onChange={(e) => handleChange('monthlyMaintenanceCost', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                  <span className="text-[10px] text-slate-500">{formatINR(Number(formData.monthlyMaintenanceCost || 0))}</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Active Maintenance Jobs</label>
                  <input
                    type="number"
                    value={formData.activeMaintenanceJobs ?? 3}
                    onChange={(e) => handleChange('activeMaintenanceJobs', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Average Repair Cost (₹)</label>
                  <input
                    type="number"
                    value={formData.avgRepairCost ?? 14500}
                    onChange={(e) => handleChange('avgRepairCost', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Next Maintenance Due</label>
                  <input
                    type="text"
                    value={formData.nextMaintenanceDue ?? '12 Sep 2026'}
                    onChange={(e) => handleChange('nextMaintenanceDue', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Maintenance Reserve (₹)</label>
                  <input
                    type="number"
                    value={formData.maintenanceReserve ?? 150000}
                    onChange={(e) => handleChange('maintenanceReserve', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 13. OTHER */}
          {opId === 'other' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Custom Operation Name</label>
                  <input
                    type="text"
                    value={formData.customOpName ?? 'Custom Operations'}
                    onChange={(e) => handleChange('customOpName', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Monthly Budget / Value (₹)</label>
                  <input
                    type="number"
                    value={formData.monthlyValueCost ?? 50000}
                    onChange={(e) => handleChange('monthlyValueCost', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-900 outline-none"
                  />
                  <span className="text-[10px] text-slate-500">{formatINR(Number(formData.monthlyValueCost || 0))}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Description</label>
                <textarea
                  rows={2}
                  value={formData.description ?? 'General operational commitments and miscellaneous services'}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-medium text-slate-900 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Notes & Tracking Key</label>
                <textarea
                  rows={2}
                  value={formData.notes ?? 'Configured for specialized workflow management.'}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-medium text-slate-900 outline-none"
                />
              </div>
            </div>
          )}

        </form>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 flex-shrink-0">
          <div>
            {isActive && !showDeactivateConfirm && (
              <button
                type="button"
                onClick={() => setShowDeactivateConfirm(true)}
                className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
              >
                Deactivate Operation
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="op-config-form"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
