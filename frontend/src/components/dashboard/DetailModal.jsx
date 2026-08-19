import React, { useState } from 'react';

/**
 * Universal DetailModal Component — LIGHT FINTECH STYLING
 * 
 * Renders rich detailed views when users click KPI cards, alerts, or menu actions:
 * - Cash Overview Details
 * - Receivables / Invoice Details
 * - Payables Details
 * - Forecast Details & Settings
 * - Compare With Metric
 * - Export Forecast
 * - Alert Details & Filtered Lists
 */
export default function DetailModal({
  isOpen,
  onClose,
  type = 'cash-overview',
  currentProfile,
}) {
  const [exportFormat, setExportFormat] = useState('csv');
  const [isExported, setIsExported] = useState(false);
  const [safetyBufferInput, setSafetyBufferInput] = useState(500000);
  const [compareMetric, setCompareMetric] = useState('prev-month');

  if (!isOpen) return null;

  const handleExport = () => {
    setIsExported(true);
    setTimeout(() => {
      setIsExported(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-900 overflow-hidden my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              {type === 'cash-overview' && 'Cash Available — Detailed Ledger'}
              {type === 'receivables' && 'Receivables & Invoice Ledger'}
              {type === 'payables' && 'Payables & Supplier Settlements'}
              {type === 'runway' && 'Cash Runway & Safety Analysis'}
              {type === 'compare' && 'Compare Metric With Baseline'}
              {type === 'forecast-settings' && 'Forecast Simulation Settings'}
              {type === 'export-forecast' && 'Export Cash Flow Forecast'}
              {type === 'all-alerts' && 'Operational Attention & Risk Feed'}
              {type === 'alert-detail' && 'Alert Resolution Details'}
            </h3>
            <p className="text-xs text-slate-500">
              {currentProfile?.name || 'Universal MSME Workspace'} • Verified Data Stream
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: CASH OVERVIEW */}
        {/* ========================================================================= */}
        {type === 'cash-overview' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-500 text-[10px] font-bold uppercase">Total Liquid Cash</span>
                <p className="text-lg font-black text-emerald-600 num-tabular">₹14,85,000</p>
                <span className="text-[10px] text-slate-400">100% available</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-500 text-[10px] font-bold uppercase">Primary Bank A/C</span>
                <p className="text-lg font-black text-slate-900 num-tabular">₹11,45,000</p>
                <span className="text-[10px] text-blue-600">HDFC Current (Verified)</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-500 text-[10px] font-bold uppercase">Auto-Sweep Deposit</span>
                <p className="text-lg font-black text-amber-600 num-tabular">₹3,40,000</p>
                <span className="text-[10px] text-slate-400">Overnight interest</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-slate-700 text-xs">Recent Verified Bank Movements:</span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">Client Wire Credit (RTGS)</p>
                    <p className="text-[10px] text-slate-500">Today, 11:30 AM • Inward remittance</p>
                  </div>
                  <span className="text-emerald-600 font-bold font-mono">+₹1,80,000</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">Vendor Cheque Clearance</p>
                    <p className="text-[10px] text-slate-500">Yesterday, 04:15 PM • Operational supplies</p>
                  </div>
                  <span className="text-rose-600 font-bold font-mono">-₹45,000</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: RECEIVABLES */}
        {/* ========================================================================= */}
        {type === 'receivables' && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-100">
              <span className="text-slate-700">Total Outstanding Invoices: <strong className="text-slate-900">12</strong></span>
              <span className="text-blue-700 font-bold font-mono text-sm">₹28,50,000</span>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-slate-700">Upcoming Expected Inflows:</span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">INV-101 • Acme Global</span>
                    <p className="text-[10px] text-amber-600 font-medium">Due Aug 31 • Projected ~28d delay</p>
                  </div>
                  <span className="font-bold font-mono text-slate-900">₹2,50,000</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">INV-102 • Bharat Industries</span>
                    <p className="text-[10px] text-emerald-600 font-medium">Due Sep 05 • High certainty (98%)</p>
                  </div>
                  <span className="font-bold font-mono text-slate-900">₹3,10,000</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">INV-103 • Zenith Logistics</span>
                    <p className="text-[10px] text-emerald-600 font-medium">Due Sep 12 • Standard terms</p>
                  </div>
                  <span className="font-bold font-mono text-slate-900">₹1,75,000</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: PAYABLES */}
        {/* ========================================================================= */}
        {type === 'payables' && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50 border border-rose-100">
              <span className="text-slate-700">Committed 30-Day Settlements: <strong className="text-slate-900">8</strong></span>
              <span className="text-rose-700 font-bold font-mono text-sm">₹19,20,000</span>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-slate-700">Upcoming Outflow Schedule:</span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">Supplier Bill • Primary Raw Material</span>
                    <p className="text-[10px] text-slate-500">Due Aug 28 • Bank transfer scheduled</p>
                  </div>
                  <span className="font-bold font-mono text-rose-600">₹80,000</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">Monthly Staff Wages & Payroll</span>
                    <p className="text-[10px] text-slate-500">Due Aug 30 • Direct account deposit</p>
                  </div>
                  <span className="font-bold font-mono text-rose-600">₹1,20,000</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">Electricity HT & Utility Bill</span>
                    <p className="text-[10px] text-slate-500">Due Sep 02 • Auto-debit</p>
                  </div>
                  <span className="font-bold font-mono text-rose-600">₹95,000</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: CASH RUNWAY */}
        {/* ========================================================================= */}
        {type === 'runway' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-emerald-800 font-bold text-sm">38 Days Operating Runway</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  LOW RISK
                </span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Based on existing cash of <strong className="text-slate-900">₹14.85L</strong> and average daily burn rate of <strong className="text-slate-900">₹24,000</strong>, your business has 38 continuous operating days before reaching the ₹5.0L safety buffer.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-[10px]">Net Daily Cash Burn:</span>
                <span className="text-slate-900 font-bold text-sm">₹24,000 / day</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-[10px]">Safety Buffer Baseline:</span>
                <span className="text-purple-700 font-bold text-sm">₹5,00,000</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 5: COMPARE WITH */}
        {/* ========================================================================= */}
        {type === 'compare' && (
          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-600 font-bold block">Select Comparison Baseline:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'prev-month', label: 'Previous Month' },
                  { id: 'target', label: 'Quarterly Target' },
                  { id: 'industry', label: 'MSME Benchmark' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCompareMetric(item.id)}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      compareMetric === item.id
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-800">Current Month Value</span>
                <span className="font-bold text-emerald-600 font-mono text-sm">₹14,85,000</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">
                  {compareMetric === 'prev-month' && 'Previous Month Baseline'}
                  {compareMetric === 'target' && 'Quarterly Target'}
                  {compareMetric === 'industry' && 'Industry MSME Median'}
                </span>
                <span className="font-bold text-slate-700 font-mono text-sm">
                  {compareMetric === 'prev-month' && '₹14,25,000'}
                  {compareMetric === 'target' && '₹12,00,000'}
                  {compareMetric === 'industry' && '₹9,50,000'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="font-bold text-slate-700">Variance Delta:</span>
                <span className="font-bold text-emerald-600 text-sm">
                  {compareMetric === 'prev-month' && '+₹60,000 (+4.2% Growth)'}
                  {compareMetric === 'target' && '+₹2,85,000 (123% of Target)'}
                  {compareMetric === 'industry' && '+56% Above MSME Median'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 6: FORECAST SETTINGS */}
        {/* ========================================================================= */}
        {type === 'forecast-settings' && (
          <div className="space-y-4 text-xs">
            <div className="space-y-2">
              <label className="text-slate-700 font-bold block">
                Minimum Cash Safety Buffer Threshold (₹):
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="200000"
                  max="1500000"
                  step="50000"
                  value={safetyBufferInput}
                  onChange={(e) => setSafetyBufferInput(Number(e.target.value))}
                  className="flex-1 accent-emerald-500 cursor-pointer"
                />
                <span className="font-bold font-mono text-purple-700 text-sm">
                  ₹{new Intl.NumberFormat('en-IN').format(safetyBufferInput)}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Alerts trigger when rolling cash position drops below this threshold.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
              <span className="font-bold text-slate-800">Inflow Delay Weighting:</span>
              <p className="text-[11px] text-slate-500">
                Deterministic twin automatically applies historical collection lag factors on unverified customer invoices.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 7: EXPORT FORECAST */}
        {/* ========================================================================= */}
        {type === 'export-forecast' && (
          <div className="space-y-4 text-xs">
            <div className="space-y-2">
              <label className="text-slate-700 font-bold block">Select Export Format:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'csv', label: 'CSV (Timeseries)' },
                  { id: 'pdf', label: 'PDF Summary Report' },
                  { id: 'excel', label: 'Excel (XLSX)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setExportFormat(item.id)}
                    className={`p-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      exportFormat === item.id
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {isExported ? (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-center font-bold animate-fadeIn">
                ✓ Forecast export generated successfully ({exportFormat.toUpperCase()})
              </div>
            ) : (
              <button
                type="button"
                onClick={handleExport}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all hover:shadow-lg cursor-pointer"
              >
                Generate & Export {exportFormat.toUpperCase()}
              </button>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 8: ALL ALERTS */}
        {/* ========================================================================= */}
        {type === 'all-alerts' && (
          <div className="space-y-3 text-xs">
            <span className="font-bold text-slate-700 block">All Active Risk & Attention Flags:</span>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">3 receivables approaching due date</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-50 text-rose-600 border border-rose-200 font-bold">
                    RECEIVABLES
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Total: ₹4,20,000 scheduled for collection within 7 days.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Projected cash reaches lowest point on Day 18</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-600 border border-amber-200 font-bold">
                    CASH FLOW
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">On 02 Sep 2024 • ₹6,40,000 projected cash position.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">One payment concentration requires monitoring</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-600 border border-blue-200 font-bold">
                    PAYMENTS
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Vendor: Steel Works • Milestone payment coincides with month-end payroll.</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer border border-slate-200"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
