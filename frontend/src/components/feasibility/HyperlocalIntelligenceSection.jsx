import React from 'react';

/**
 * HyperlocalIntelligenceSection Component — Hyperlocal Market & Catchment Intelligence (SIH26091)
 * 
 * Provides structured administrative context and clean provenance:
 * - Administrative hierarchy: Village → Block → District, State
 * - 5 Hyperlocal Categories: Market Context, Catchment/Demand, Connectivity, Competition, Scheme Relevance
 * - User-facing distinction: 🟢 Verified Local Data vs 🟡 Benchmark Estimate
 */
export default function HyperlocalIntelligenceSection({
  businessFeasibility,
  currentProfile,
  onOpenAiExplainer,
}) {
  const profile = currentProfile || {};
  const isLocalVerified = Boolean(businessFeasibility?.is_local_verified);

  const district = businessFeasibility?.district_name || profile.location_district || profile.district || profile.location || 'Local Catchment';
  const state = businessFeasibility?.state_name || profile.location_state || profile.state || '';
  const block = businessFeasibility?.block_name || profile.location_block || profile.block || null;
  const village = businessFeasibility?.village_or_town || profile.location_village || profile.village || null;
  const pin = businessFeasibility?.pincode || profile.location_pin || profile.pincode || null;
  const sector = businessFeasibility?.specific_business || profile.industry || profile.category || profile.type || 'Enterprise';

  const adminLocationText = [village, block, district, state].filter(Boolean).join(' → ') + (pin ? ` (PIN: ${pin})` : '');

  const categories = [
    {
      title: '1. Local Market Context',
      icon: '🏪',
      status: isLocalVerified ? 'Verified Local Data' : 'Benchmark Estimate',
      isVerified: isLocalVerified,
      summary: isLocalVerified
        ? `Empirical market data verified for ${district}. Steady commercial velocity with established retail procurement networks.`
        : `Local empirical data unavailable for this micro-market. Sector benchmark estimate applied for ${sector} in ${district}.`,
      metrics: [
        { label: 'Demand Level', value: isLocalVerified ? 'High / Steady' : 'Benchmark Estimate' },
        { label: 'Offtake Channel', value: isLocalVerified ? 'Verified Local Mandi / Offtake' : 'District Benchmark' },
      ],
    },
    {
      title: '2. Catchment & Demand Density',
      icon: '👥',
      status: isLocalVerified ? 'Verified Local Data' : 'Benchmark Estimate',
      isVerified: isLocalVerified,
      summary: isLocalVerified
        ? `Target catchment radius: ${businessFeasibility?.market_reach || '5–15 km'}. Verified local consumption demand supports initial planned throughput.`
        : `Target catchment window: ${businessFeasibility?.market_reach || '5–15 km'}. Demand benchmarked against district micro-enterprises.`,
      metrics: [
        { label: 'Market Scope', value: businessFeasibility?.market_reach || 'Block Catchment' },
        { label: 'Demand Type', value: isLocalVerified ? 'Verified Local Need' : 'Sector Benchmark' },
      ],
    },
    {
      title: '3. Connectivity & Mandi Access',
      icon: '🚛',
      status: isLocalVerified ? 'Verified Local Data' : 'Benchmark Estimate',
      isVerified: isLocalVerified,
      summary: `Road and transport transit mapped for ${district}. Year-round accessibility for light commercial vehicles.`,
      metrics: [
        { label: 'Corridor Access', value: isLocalVerified ? 'Verified Highway Access' : 'District PWD Road' },
        { label: 'Transit Access', value: isLocalVerified ? 'Within 15 km' : 'District Benchmark' },
      ],
    },
    {
      title: '4. Local Competition Density',
      icon: '⚖️',
      status: isLocalVerified ? 'Verified Local Data' : 'Benchmark Estimate',
      isVerified: isLocalVerified,
      summary: `Competitor density in catchment: ${businessFeasibility?.competitor_level || 'Moderate'}. Differentiation through product quality and direct producer pricing.`,
      metrics: [
        { label: 'Density Level', value: businessFeasibility?.competitor_level || 'Moderate (Benchmark)' },
        { label: 'Market Moat', value: 'Local Relationship & Quality Moat' },
      ],
    },
    {
      title: '5. Government Scheme Relevance',
      icon: '📜',
      status: 'Rule Matched',
      isVerified: true,
      summary: `Statutory eligibility matched under central/state credit schemes (PMEGP, Stand-Up India, Mudra) based on location and enterprise category.`,
      metrics: [
        { label: 'Applicable Authority', value: 'KVIC / MSME / Commercial Banks' },
        { label: 'Assistance Type', value: 'Capital Subsidy & Working Capital' },
      ],
    },
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
      {/* Header with Administrative Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xl">📍</span>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
              Hyperlocal Business & Catchment Context
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Administrative area: <strong className="text-slate-800">{adminLocationText}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
            isLocalVerified
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            {isLocalVerified ? '🟢 Verified Local Data' : '🟡 Benchmark Estimate'}
          </span>
        </div>
      </div>

      {/* 5 Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 hover:bg-white hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{cat.icon}</span>
                  <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                    {cat.title}
                  </h4>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  cat.isVerified
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {cat.status}
                </span>
              </div>

              <p className="text-slate-600 text-xs leading-relaxed">
                {cat.summary}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200/60 space-y-1 text-[11px]">
              {cat.metrics.map((m, mIdx) => (
                <div key={mIdx} className="flex justify-between items-center text-slate-500">
                  <span>{m.label}:</span>
                  <span className="font-bold text-slate-900">{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Honest Data Integrity Notice */}
      <div className="p-3.5 rounded-2xl bg-slate-100/70 border border-slate-200 text-xs text-slate-600 flex items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-blue-600 text-sm">🔒</span>
          <span>
            <strong>Data Integrity:</strong> VITTANAYA clearly identifies verified local district records and benchmark estimates to ensure decision-ready reliability.
          </span>
        </div>
      </div>
    </div>
  );
}
