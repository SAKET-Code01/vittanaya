import React from 'react';
import { useWorkspace } from '../context/WorkspaceContext';

/**
 * SchemePage — Matched Government Schemes Module
 */
export default function SchemePage({ currentProfile: propProfile, onNavigateHome }) {
  const { currentProfile: contextProfile } = useWorkspace();
  const currentProfile = propProfile || contextProfile;

  const navigateBack = onNavigateHome || (() => window.history.back());

  const schemes = [
    {
      id: 'pmegp',
      name: 'PMEGP (Prime Minister Employment Generation Programme)',
      badge: 'TOP MATCH • 98% Fit',
      badgeType: 'emerald',
      subsidy: 'Up to 35% Margin Money Subsidy',
      maxCost: '₹ 50,00,000 for Manufacturing / ₹ 20,00,000 for Service',
      promoterShare: '5% to 10%',
      tenure: '7 Years with 6–12 months moratorium',
      collateral: 'Collateral-free up to ₹10 Lakhs (CGTMSE)',
      features: [
        'Direct DBT subsidy credit after physical verification.',
        'Supported through KVIC / KVIB / DIC / State Nodal Banks.',
        'Entrepreneurship Development Programme (EDP) training included.',
      ],
      isPrimary: true,
    },
    {
      id: 'mudra-tarun',
      name: 'Pradhan Mantri Mudra Yojana (Tarun Scheme)',
      badge: 'SECONDARY MATCH • 85% Fit',
      badgeType: 'amber',
      subsidy: 'Interest Subvention on prompt repayment',
      maxCost: '₹ 5,00,000 to ₹ 10,00,000',
      promoterShare: '15%',
      tenure: '5 Years with flexible working capital CC/OD',
      collateral: 'Zero collateral required under Mudra guarantee',
      features: [
        'Instant digital processing with simplified MSME checklist.',
        'Mudra Card for seamless working capital drawdowns.',
      ],
      isPrimary: false,
    },
    {
      id: 'cgtmse',
      name: 'CGTMSE (Credit Guarantee Fund Trust for MSEs)',
      badge: 'COLLATERAL COVER • 100% Fit',
      badgeType: 'blue',
      subsidy: 'Credit guarantee coverage up to 85%',
      maxCost: 'Up to ₹ 5,00,000',
      promoterShare: 'Standard Bank Norms',
      tenure: 'Synchronized with underlying term loan',
      collateral: '100% Third-party collateral free',
      features: [
        'Eliminates need for mortgage or property collateral.',
        'Annual guarantee fee supported under MSME ministry.',
      ],
      isPrimary: false,
    },
  ];

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
            <span className="text-[#102A1E] font-bold">Scheme Matching</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A211D] tracking-tight">
            Government Subsidies & Institutional Schemes
          </h1>
          <p className="text-xs sm:text-sm text-[#607267] mt-0.5">
            Personalized scheme rankings for {currentProfile?.name || 'Your Enterprise'} in {currentProfile?.location || 'India'}
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

      {/* 2. Scheme Cards List */}
      <div className="space-y-5">
        {schemes.map((scheme) => (
          <div
            key={scheme.id}
            className={`rounded-3xl p-6 sm:p-7 border transition-all ${
              scheme.isPrimary
                ? 'bg-white border-[#2F7757]/40 shadow-card-hover'
                : 'bg-white border-[#E8E2D5] shadow-card-soft'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F4EFE6]">
              <div>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase mb-2 ${
                    scheme.badgeType === 'emerald'
                      ? 'bg-[#E8F1EC] text-[#2F7757] border border-[#2F7757]/30'
                      : scheme.badgeType === 'amber'
                      ? 'bg-[#FEF8E7] text-[#D4A343] border border-[#D4A343]/30'
                      : 'bg-[#EBF4FE] text-[#3B82F6] border border-[#3B82F6]/30'
                  }`}
                >
                  {scheme.badge}
                </span>
                <h2 className="text-lg sm:text-xl font-black text-[#1A211D]">
                  {scheme.name}
                </h2>
              </div>

              <button
                type="button"
                className="px-5 py-2.5 rounded-2xl bg-[#102A1E] hover:bg-[#153928] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
              >
                Apply via Portal →
              </button>
            </div>

            {/* Scheme Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-4 text-xs">
              <div className="p-3 rounded-2xl bg-[#FAF7F2]">
                <p className="text-[10px] font-bold text-[#819388] uppercase">Subsidy / Benefit</p>
                <p className="font-extrabold text-[#2F7757] mt-0.5">{scheme.subsidy}</p>
              </div>
              <div className="p-3 rounded-2xl bg-[#FAF7F2]">
                <p className="text-[10px] font-bold text-[#819388] uppercase">Max Project Cap</p>
                <p className="font-extrabold text-[#1A211D] mt-0.5">{scheme.maxCost}</p>
              </div>
              <div className="p-3 rounded-2xl bg-[#FAF7F2]">
                <p className="text-[10px] font-bold text-[#819388] uppercase">Own Contribution</p>
                <p className="font-extrabold text-[#D4A343] mt-0.5">{scheme.promoterShare}</p>
              </div>
              <div className="p-3 rounded-2xl bg-[#FAF7F2]">
                <p className="text-[10px] font-bold text-[#819388] uppercase">Collateral Security</p>
                <p className="font-extrabold text-[#1A211D] mt-0.5">{scheme.collateral}</p>
              </div>
            </div>

            {/* Features List */}
            <div className="pt-2">
              <p className="text-[11px] font-bold text-[#607267] uppercase tracking-wider mb-2">
                Key Scheme Guidelines
              </p>
              <ul className="space-y-1.5 text-xs text-[#2D3832]">
                {scheme.features.map((feat, fIdx) => (
                  <li key={fIdx} className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2F7757]" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
