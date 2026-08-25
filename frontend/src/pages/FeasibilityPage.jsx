import React from 'react';
import { CircularScoreGauge } from '../components/common/JapaneseArtwork';
import { useWorkspace } from '../context/WorkspaceContext';

/**
 * FeasibilityPage — Detailed Hyper-Local Feasibility Module
 */
export default function FeasibilityPage({ currentProfile: propProfile, onNavigateHome }) {
  const { currentProfile: contextProfile } = useWorkspace();
  const currentProfile = propProfile || contextProfile;
  const score = 78;

  const navigateBack = onNavigateHome || (() => window.history.back());

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
            <span className="text-[#102A1E] font-bold">Feasibility Module</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A211D] tracking-tight">
            Hyper-Local Business Feasibility Analysis
          </h1>
          <p className="text-xs sm:text-sm text-[#607267] mt-0.5">
            5–10 km catchment assessment for {currentProfile?.name || 'Your Enterprise'} in {currentProfile?.location || 'India'}
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

      {/* 2. Feasibility Hero Score & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Score Gauge Card */}
        <div className="lg:col-span-4 bg-[#0F291E] text-white rounded-3xl p-6 shadow-hero-forest flex flex-col items-center text-center justify-between">
          <p className="text-xs font-bold text-[#A6B5AC] uppercase tracking-wider">
            OVERALL FEASIBILITY INDEX
          </p>
          <div className="my-4">
            <CircularScoreGauge score={score} size={140} strokeWidth={12} />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">Good Potential</h3>
            <p className="text-xs text-[#A6B5AC] mt-1 leading-relaxed">
              Business fundamentals and local purchasing power support sustainable operational scale with 78% certainty.
            </p>
          </div>
        </div>

        {/* 3 Pillar Deep Dive */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Pillar 1 */}
          <div className="bg-white rounded-3xl border border-[#E8E2D5] p-5 shadow-card-soft flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-[#E8F1EC] text-[#2F7757] flex items-center justify-center font-bold text-sm mb-3">
                92%
              </div>
              <h3 className="text-sm font-extrabold text-[#1A211D]">Market Fit</h3>
              <p className="text-xs text-[#607267] mt-1 leading-relaxed">
                12,450 consumer households in radius with high demand in underserved category niches.
              </p>
            </div>
            <div className="pt-3 border-t border-[#F4EFE6] text-[11px] font-bold text-[#2F7757]">
              ● Strong Local Demand
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white rounded-3xl border border-[#E8E2D5] p-5 shadow-card-soft flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-[#FEF8E7] text-[#D4A343] flex items-center justify-center font-bold text-sm mb-3">
                81%
              </div>
              <h3 className="text-sm font-extrabold text-[#1A211D]">Financial Fit</h3>
              <p className="text-xs text-[#607267] mt-1 leading-relaxed">
                Project cost ₹10L covered via 70% loan + PMEGP subsidy with 2.8x debt service coverage.
              </p>
            </div>
            <div className="pt-3 border-t border-[#F4EFE6] text-[11px] font-bold text-[#D4A343]">
              ● Healthy Cash Cushion
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white rounded-3xl border border-[#E8E2D5] p-5 shadow-card-soft flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-[#E8F1EC] text-[#2F7757] flex items-center justify-center font-bold text-sm mb-3">
                18%
              </div>
              <h3 className="text-sm font-extrabold text-[#1A211D]">Risk Exposure</h3>
              <p className="text-xs text-[#607267] mt-1 leading-relaxed">
                Low competition saturation (18 units) and government policy protection against price shock.
              </p>
            </div>
            <div className="pt-3 border-t border-[#F4EFE6] text-[11px] font-bold text-[#2F7757]">
              ● Controlled Low Risk
            </div>
          </div>

        </div>

      </div>

      {/* 3. Detailed SWOT Matrix */}
      <div className="bg-white rounded-3xl border border-[#E8E2D5] p-6 shadow-card-soft space-y-4">
        <h2 className="text-base font-extrabold text-[#1A211D]">
          Comprehensive Strategic SWOT Analysis
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Strengths */}
          <div className="p-4 rounded-2xl bg-[#E8F1EC] border border-[#D2E3D8]">
            <h3 className="text-sm font-extrabold text-[#2F7757] flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-[#2F7757] text-white flex items-center justify-center text-xs">S</span>
              <span>Strengths</span>
            </h3>
            <ul className="mt-2 space-y-1.5 text-xs text-[#2D3832]">
              <li>• Established local consumer base with recurring demand.</li>
              <li>• Experienced workforce and technical capability.</li>
              <li>• High product margin buffer between ₹80 – ₹150 unit pricing.</li>
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="p-4 rounded-2xl bg-[#FEF8E7] border border-[#FDEEC6]">
            <h3 className="text-sm font-extrabold text-[#D4A343] flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-[#D4A343] text-white flex items-center justify-center text-xs">W</span>
              <span>Weaknesses</span>
            </h3>
            <ul className="mt-2 space-y-1.5 text-xs text-[#2D3832]">
              <li>• Limited initial brand recognition in adjacent sub-districts.</li>
              <li>• Dependency on regional transport logistics for raw material.</li>
              <li>• Manual billing and collection reconciliation in early stage.</li>
            </ul>
          </div>

          {/* Opportunities */}
          <div className="p-4 rounded-2xl bg-[#E8F1EC] border border-[#D2E3D8]">
            <h3 className="text-sm font-extrabold text-[#2F7757] flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-[#2F7757] text-white flex items-center justify-center text-xs">O</span>
              <span>Opportunities</span>
            </h3>
            <ul className="mt-2 space-y-1.5 text-xs text-[#2D3832]">
              <li>• Government subsidized expansion schemes (PMEGP / Mudra).</li>
              <li>• Growing urban population migration into peri-urban center.</li>
              <li>• B2B supply tie-ups with district retail chains.</li>
            </ul>
          </div>

          {/* Threats */}
          <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FEE2E2]">
            <h3 className="text-sm font-extrabold text-[#DC2626] flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-[#DC2626] text-white flex items-center justify-center text-xs">T</span>
              <span>Threats</span>
            </h3>
            <ul className="mt-2 space-y-1.5 text-xs text-[#2D3832]">
              <li>• Potential price undercutting by larger regional wholesale distributors.</li>
              <li>• Fluctuations in commodity raw material costs.</li>
              <li>• Delayed payment cycles from wholesale retail buyers.</li>
            </ul>
          </div>

        </div>
      </div>

    </div>
  );
}
