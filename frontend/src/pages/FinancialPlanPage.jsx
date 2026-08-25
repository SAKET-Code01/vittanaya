import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';

/**
 * FinancialPlanPage — Detailed Financial Structuring & Planning Module
 */
export default function FinancialPlanPage({ currentProfile: propProfile, onNavigateHome }) {
  const { currentProfile: contextProfile } = useWorkspace();
  const currentProfile = propProfile || contextProfile;

  const [projectCostInput, setProjectCostInput] = useState(1000000);
  const [marginPct, setMarginPct] = useState(10);
  const [loanTenureYears, setLoanTenureYears] = useState(7);
  const [interestRate, setInterestRate] = useState(8.5);

  const navigateBack = onNavigateHome || (() => window.history.back());

  const ownMarginCapital = Math.round((projectCostInput * marginPct) / 100);
  const loanAmount = projectCostInput - ownMarginCapital;
  
  // Quarterly repayment calculation
  const totalMonths = loanTenureYears * 12;
  const monthlyRate = interestRate / 100 / 12;
  const monthlyEmi = Math.round(
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1)
  );
  const quarterlyRepayment = monthlyEmi * 3;

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-12">
      
      {/* 1. Header with Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#607267] mb-1">
            <button
              type="button"
              onClick={navigateBack}
              className="hover:text-[#102A1E] transition-colors cursor-pointer"
            >
              Dashboard
            </button>
            <span>/</span>
            <span className="text-[#102A1E] font-bold">Financial Plan</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A211D] tracking-tight">
            Financial Structuring & Capital Allocation
          </h1>
          <p className="text-xs sm:text-sm text-[#607267] mt-0.5">
            DPR-ready Capex, Margin capital, and Working capital models for {currentProfile?.name || 'Your Enterprise'} in {currentProfile?.location || 'India'}
          </p>
        </div>

        <button
          type="button"
          onClick={navigateBack}
          className="px-4 py-2 rounded-2xl bg-white border border-[#E8E2D5] text-xs font-bold text-[#1A211D] hover:bg-[#FAF7F2] transition-colors shadow-2xs cursor-pointer flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <span>← Back to Dashboard</span>
        </button>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Project Cost */}
        <div className="bg-white rounded-3xl border border-[#E8E2D5] p-5 shadow-card-soft">
          <p className="text-[11px] font-bold text-[#607267] uppercase tracking-wider">Project Cost</p>
          <p className="text-2xl font-black text-[#1A211D] mt-1">₹ {projectCostInput.toLocaleString('en-IN')}</p>
          <p className="text-xs text-[#2F7757] font-semibold mt-0.5">Total CapEx + Initial Working Capital</p>
        </div>

        {/* Own Margin Capital */}
        <div className="bg-white rounded-3xl border border-[#E8E2D5] p-5 shadow-card-soft">
          <p className="text-[11px] font-bold text-[#607267] uppercase tracking-wider">Own Margin Capital</p>
          <p className="text-2xl font-black text-[#D4A343] mt-1">₹ {ownMarginCapital.toLocaleString('en-IN')}</p>
          <p className="text-xs text-[#607267] font-semibold mt-0.5">{marginPct}% Promoter Equity Contribution</p>
        </div>

        {/* Maximum Loan Amount */}
        <div className="bg-white rounded-3xl border border-[#E8E2D5] p-5 shadow-card-soft">
          <p className="text-[11px] font-bold text-[#607267] uppercase tracking-wider">Maximum Loan Amount</p>
          <p className="text-2xl font-black text-[#102A1E] mt-1">₹ {loanAmount.toLocaleString('en-IN')}</p>
          <p className="text-xs text-[#2F7757] font-semibold mt-0.5">{100 - marginPct}% Bank Financed</p>
        </div>

        {/* Quarterly Repayment */}
        <div className="bg-white rounded-3xl border border-[#E8E2D5] p-5 shadow-card-soft">
          <p className="text-[11px] font-bold text-[#607267] uppercase tracking-wider">Quarterly Repayment</p>
          <p className="text-2xl font-black text-[#1A211D] mt-1">₹ {quarterlyRepayment.toLocaleString('en-IN')}</p>
          <p className="text-xs text-[#607267] font-semibold mt-0.5">₹ {monthlyEmi.toLocaleString('en-IN')} / mo ({loanTenureYears}-Yr Tenure)</p>
        </div>

      </div>

      {/* 3. Interactive Structuring Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Controls */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-[#E8E2D5] p-6 shadow-card-soft space-y-5">
          <h2 className="text-base font-extrabold text-[#1A211D]">
            Interactive Financial Parameters
          </h2>

          {/* Project Cost Slider */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-[#607267]">Total Project Cost</span>
              <span className="text-[#1A211D]">₹ {projectCostInput.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="200000"
              max="5000000"
              step="50000"
              value={projectCostInput}
              onChange={(e) => setProjectCostInput(Number(e.target.value))}
              className="w-full accent-[#2F7757] cursor-pointer"
            />
          </div>

          {/* Margin Contribution Slider */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-[#607267]">Promoter Margin Contribution</span>
              <span className="text-[#1A211D]">{marginPct}% (₹ {ownMarginCapital.toLocaleString('en-IN')})</span>
            </div>
            <input
              type="range"
              min="5"
              max="25"
              step="1"
              value={marginPct}
              onChange={(e) => setMarginPct(Number(e.target.value))}
              className="w-full accent-[#D4A343] cursor-pointer"
            />
          </div>

          {/* Loan Tenure Slider */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-[#607267]">Loan Amortization Tenure</span>
              <span className="text-[#1A211D]">{loanTenureYears} Years</span>
            </div>
            <input
              type="range"
              min="3"
              max="10"
              step="1"
              value={loanTenureYears}
              onChange={(e) => setLoanTenureYears(Number(e.target.value))}
              className="w-full accent-[#2F7757] cursor-pointer"
            />
          </div>

          {/* Interest Rate */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-[#607267]">Bank Interest Rate (p.a.)</span>
              <span className="text-[#1A211D]">{interestRate}%</span>
            </div>
            <input
              type="range"
              min="6.5"
              max="12"
              step="0.25"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full accent-[#2F7757] cursor-pointer"
            />
          </div>
        </div>

        {/* Cost Breakdown Sheet */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-[#E8E2D5] p-6 shadow-card-soft space-y-4">
          <h2 className="text-base font-extrabold text-[#1A211D]">
            Project Cost Breakdown (DPR Schedule)
          </h2>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F2]">
              <span className="font-semibold text-[#445249]">Plant & Core Machinery</span>
              <span className="font-bold text-[#1A211D]">₹ {Math.round(projectCostInput * 0.55).toLocaleString('en-IN')} (55%)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F2]">
              <span className="font-semibold text-[#445249]">Premises & Electrical Fitments</span>
              <span className="font-bold text-[#1A211D]">₹ {Math.round(projectCostInput * 0.15).toLocaleString('en-IN')} (15%)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F2]">
              <span className="font-semibold text-[#445249]">Working Capital (Raw Material & Payroll)</span>
              <span className="font-bold text-[#1A211D]">₹ {Math.round(projectCostInput * 0.20).toLocaleString('en-IN')} (20%)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F2]">
              <span className="font-semibold text-[#445249]">Pre-operative & Contingency Buffer</span>
              <span className="font-bold text-[#1A211D]">₹ {Math.round(projectCostInput * 0.10).toLocaleString('en-IN')} (10%)</span>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E8E2D5] flex items-center justify-between font-extrabold text-sm text-[#1A211D]">
            <span>Total Capital Required</span>
            <span className="text-[#2F7757]">₹ {projectCostInput.toLocaleString('en-IN')}</span>
          </div>
        </div>

      </div>

    </div>
  );
}
