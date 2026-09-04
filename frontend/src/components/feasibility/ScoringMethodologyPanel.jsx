import React, { useState } from 'react';

/**
 * ScoringMethodologyPanel Component — AHP 8-Step Scoring Methodology Guide (SIH26091)
 * 
 * Explains the complete Analytic Hierarchy Process (AHP) workflow in a clean, intuitive,
 * presentation-ready format for evaluation panels and micro-entrepreneurs.
 */
export default function ScoringMethodologyPanel({ methodologyGuide, ahpWeights }) {
  const [activeStepTab, setActiveStepTab] = useState('all');

  const criteria = [
    { key: 'M', code: 'market', name: 'Market Catchment & Demand', weight: '30.24%', points: '30 pts', desc: 'Population density, buying velocity, mandi offtake guarantees' },
    { key: 'F', code: 'financial', name: 'Financial Viability & Margin', weight: '24.62%', points: '25 pts', desc: 'Equity margin ratio, bank loan affordability, DSCR debt coverage' },
    { key: 'L', code: 'location', name: 'Location & Mandi Connectivity', weight: '15.05%', points: '15 pts', desc: 'All-weather roads, mandi distance, supply-chain logistics corridor' },
    { key: 'C', code: 'competition', name: 'Competition & Barrier to Entry', weight: '15.05%', points: '15 pts', desc: 'Competitor vendor density, differentiation moats, market share' },
    { key: 'R', code: 'risk', name: 'Risk Resilience & Buffer', weight: '15.05%', points: '15 pts', desc: 'Cash runway, 45-day liquidity buffer, seasonal revenue stability' },
  ];

  const steps = [
    {
      step: 1,
      title: 'Define 5 Core Feasibility Dimensions',
      desc: 'Identify the five foundational pillars critical for rural micro-enterprise survival under Smart India Hackathon Problem SIH26091.',
      formula: 'Criteria Set C = {Market, Financial, Location, Competition, Risk}',
    },
    {
      step: 2,
      title: 'Domain Expert Pairwise Comparisons',
      desc: 'Chartered Accountants, Banking Officers, MSME Consultants, and Entrepreneurs compare all 10 pairs on Saaty\'s 1–9 fundamental scale.',
      formula: 'Score a_ij ∈ {1, 2, ..., 9} where 1 = Equal, 9 = Extreme Importance',
    },
    {
      step: 3,
      title: 'Multi-Expert Geometric Mean Aggregation',
      desc: 'Individual expert scores are aggregated using the Geometric Mean to avoid arithmetic skew and maintain reciprocal symmetry.',
      formula: 'GM(x_1, ..., x_n) = (x_1 × x_2 × ... × x_n)^(1/n)',
    },
    {
      step: 4,
      title: 'Generate 5×5 Reciprocal Matrix',
      desc: 'Construct reciprocal matrix A where diagonal values are 1.0 and transpose entries satisfy A[j][i] = 1 / A[i][j].',
      formula: 'A_ii = 1.0,  A_ji = 1 / A_ij',
    },
    {
      step: 5,
      title: 'Calculate Row Geometric Means',
      desc: 'Compute the 5th root of the product of all 5 row elements to establish the unnormalized relative priority vector for each criterion.',
      formula: 'GM_i = (A_i1 × A_i2 × A_i3 × A_i4 × A_i5)^(1/5)',
    },
    {
      step: 6,
      title: 'Normalize Criterion Priority Weights',
      desc: 'Divide each row geometric mean by the sum of all row geometric means to produce final normalized weights summing to 1.0 (100%).',
      formula: 'W_i = GM_i / SUM(GM_all_rows),  where SUM(W_i) = 1.0 (100%)',
    },
    {
      step: 7,
      title: 'Mathematical Consistency Ratio Verification',
      desc: 'Calculate Weighted Sum Vector, determine lambda_max, and compute Consistency Ratio (CR). Verify CR < 0.10 for acceptable consistency.',
      formula: 'CI = (lambda_max - n) / (n - 1),  CR = CI / RI = 0.0033 < 0.10 (Consistent)',
    },
    {
      step: 8,
      title: 'Multi-Criteria Feasibility Scoring',
      desc: 'Apply normalized weights to verified raw 0–100 business performance scores to determine the single authoritative feasibility score.',
      formula: 'Final Feasibility Score = SUM(Raw Criterion Score_i × AHP Weight_i)',
    },
  ];

  const saatyScale = [
    { intensity: 1, definition: 'Equal Importance', explanation: 'Two factors contribute equally to business feasibility.' },
    { intensity: 3, definition: 'Moderate Importance', explanation: 'Experience and judgment slightly favor one factor over another.' },
    { intensity: 5, definition: 'Strong Importance', explanation: 'Experience and judgment strongly favor one factor over another.' },
    { intensity: 7, definition: 'Very Strong / Demonstrated Importance', explanation: 'A factor is favored very strongly over another in practice.' },
    { intensity: 9, definition: 'Extreme / Absolute Importance', explanation: 'Evidence favoring one factor over another is of the highest affirmation.' },
  ];

  // 5x5 Reciprocal Matrix (Dataset B Illustrative Worked Example)
  const matrixData = [
    { name: 'Market Catchment (M)', row: [1.000, 1.246, 2.091, 2.091, 2.091], gm: 1.637, weight: '30.24%', pts: 30 },
    { name: 'Financial Viability (F)', row: [0.803, 1.000, 1.679, 1.679, 1.679], gm: 1.333, weight: '24.62%', pts: 25 },
    { name: 'Location Connectivity (L)', row: [0.478, 0.596, 1.000, 1.000, 1.000], gm: 0.815, weight: '15.05%', pts: 15 },
    { name: 'Competition Barrier (C)', row: [0.478, 0.596, 1.000, 1.000, 1.000], gm: 0.815, weight: '15.05%', pts: 15 },
    { name: 'Risk Resilience (R)', row: [0.478, 0.596, 1.000, 1.000, 1.000], gm: 0.815, weight: '15.05%', pts: 15 },
  ];

  const expertBreakdown = [
    { pair: 'Market vs Financial (M/F)', scores: [1, 1, 1, 1, 3], gm: 1.246 },
    { pair: 'Market vs Location (M/L)', scores: [1, 1, 1, 4, 8], gm: 2.091 },
    { pair: 'Market vs Competition (M/C)', scores: [1, 1, 1, 4, 8], gm: 2.091 },
    { pair: 'Market vs Risk (M/R)', scores: [1, 1, 1, 4, 8], gm: 2.091 },
    { pair: 'Financial vs Location (F/L)', scores: [1, 1, 1, 2, 6], gm: 1.679 },
    { pair: 'Financial vs Competition (F/C)', scores: [1, 1, 1, 2, 6], gm: 1.679 },
    { pair: 'Financial vs Risk (F/R)', scores: [1, 1, 1, 2, 6], gm: 1.679 },
    { pair: 'Location vs Competition (L/C)', scores: [1, 1, 1, 1, 1], gm: 1.000 },
    { pair: 'Location vs Risk (L/R)', scores: [1, 1, 1, 1, 1], gm: 1.000 },
    { pair: 'Competition vs Risk (C/R)', scores: [1, 1, 1, 1, 1], gm: 1.000 },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="rounded-3xl border border-indigo-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 sm:p-8 text-white shadow-xl space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[10px] font-black uppercase tracking-wider">
            Methodology Architecture
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-bold">
            Saaty Analytic Hierarchy Process (AHP)
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          How VITTANAYA Derives Feasibility Weights
        </h2>
        <p className="text-xs sm:text-sm text-indigo-100/80 max-w-3xl leading-relaxed">
          Rather than relying on static or arbitrary percentages, VITTANAYA implements an end-to-end Analytic Hierarchy Process (AHP) pipeline to derive mathematically validated, multi-expert criterion weights.
        </p>
      </div>

      {/* 8-Step Walkthrough Grid */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
              8-Step AHP Feasibility Weighting Pipeline
            </h3>
            <p className="text-xs text-slate-500">
              A structured mathematical process ensuring transparency and zero arbitrary weight assignments.
            </p>
          </div>
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="font-bold text-slate-700">AHP Consistency:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              CR = 0.0033 &lt; 0.10 (Consistent)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {steps.map((s) => (
            <div key={s.step} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 hover:bg-indigo-50/40 hover:border-indigo-200 transition-all space-y-2 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                    {s.step}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Step {s.step} of 8</span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{s.title}</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
              <div className="p-2 rounded-xl bg-white border border-slate-200/80 font-mono text-[10px] text-indigo-700 font-bold break-all">
                {s.formula}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5x5 Reciprocal Matrix & Saaty Scale */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Reciprocal Comparison Matrix Table */}
        <div className="xl:col-span-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900">
              5×5 Reciprocal AHP Comparison Matrix (Aggregated Geometric Means)
            </h3>
            <p className="text-xs text-slate-500">
              Generated from multi-expert geometric mean aggregation satisfying reciprocal rule: <code className="font-bold text-blue-700">A[j][i] = 1 / A[i][j]</code>.
            </p>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs">
                <thead className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3 text-left">Criterion</th>
                    <th className="py-2.5 px-2">Market (M)</th>
                    <th className="py-2.5 px-2">Financial (F)</th>
                    <th className="py-2.5 px-2">Location (L)</th>
                    <th className="py-2.5 px-2">Competition (C)</th>
                    <th className="py-2.5 px-2">Risk (R)</th>
                    <th className="py-2.5 px-2 bg-indigo-50/60 text-indigo-900">Row GM</th>
                    <th className="py-2.5 px-3 bg-blue-50 text-blue-900">Normalized Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white font-mono text-xs">
                  {matrixData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3.5 text-left font-sans font-bold text-slate-900">
                        {row.name}
                      </td>
                      {row.row.map((val, cIdx) => (
                        <td key={cIdx} className={`py-3 px-2 ${idx === cIdx ? 'bg-slate-100 font-bold text-slate-900' : 'text-slate-600'}`}>
                          {val.toFixed(3)}
                        </td>
                      ))}
                      <td className="py-3 px-2 bg-indigo-50/40 font-bold text-indigo-800">
                        {row.gm.toFixed(3)}
                      </td>
                      <td className="py-3 px-3 bg-blue-50/60 font-sans font-bold text-blue-700">
                        {row.weight} <span className="text-[10px] text-slate-400 font-normal">({row.pts} pts)</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-bold text-xs text-slate-900">
                  <tr>
                    <td colSpan={6} className="py-2.5 px-3 text-right uppercase tracking-wider text-slate-500 text-[11px]">
                      Sum of Normalized Priority Weights:
                    </td>
                    <td className="py-2.5 px-2 font-mono text-indigo-900">5.415</td>
                    <td className="py-2.5 px-3 font-mono text-blue-700">1.000 (100.0%)</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed flex items-start space-x-2">
            <span className="text-blue-600 text-sm">💡</span>
            <div>
              <strong className="text-slate-900">Why are these weights non-arbitrary?</strong> In Saaty\'s AHP, row geometric means normalize to priority weights that reflect the holistic consensus of 5 domain experts without relying on arbitrary hardcoded percentages.
            </div>
          </div>
        </div>

        {/* Saaty Scale & Consistency Card */}
        <div className="xl:col-span-4 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <h3 className="text-base font-extrabold text-slate-900">
              Saaty 1–9 Fundamental Scale
            </h3>
            <p className="text-xs text-slate-500">
              Standardized rating system for pairwise comparisons.
            </p>
            <div className="space-y-2">
              {saatyScale.map((s) => (
                <div key={s.intensity} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs flex items-start space-x-2.5">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900 font-black text-xs shrink-0 font-mono">
                    {s.intensity}
                  </span>
                  <div>
                    <div className="font-bold text-slate-900">{s.definition}</div>
                    <div className="text-[11px] text-slate-500 leading-tight">{s.explanation}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <h3 className="text-base font-extrabold text-slate-900">
              AHP Mathematical Verification
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500">Number of Criteria (n):</span>
                <span className="font-bold text-slate-900 font-mono">5</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500">Random Index (RI, n=5):</span>
                <span className="font-bold text-slate-900 font-mono">1.12</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500">Principal Eigenvalue (λmax):</span>
                <span className="font-bold text-slate-900 font-mono">5.0148</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500">Consistency Index (CI):</span>
                <span className="font-bold text-slate-900 font-mono">0.0037</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 font-bold text-emerald-900">
                <span>Consistency Ratio (CR = CI/RI):</span>
                <span className="font-mono text-sm">0.0033 &lt; 0.10 ✓</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 10 Pairwise Expert Comparisons Dataset Table */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-extrabold text-slate-900">
            Multi-Expert Pairwise Survey Dataset (10 Pairwise Comparisons)
          </h3>
          <p className="text-xs text-slate-500">
            Raw pairwise ratings provided across 5 diverse domain stakeholders, aggregated via Geometric Mean.
          </p>
        </div>

        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs">
              <thead className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 text-left">Pairwise Comparison</th>
                  <th className="py-2.5 px-2">Chartered Accountant</th>
                  <th className="py-2.5 px-2">Market Expert</th>
                  <th className="py-2.5 px-2">Banking / MSME Officer</th>
                  <th className="py-2.5 px-2">Business Consultant</th>
                  <th className="py-2.5 px-2">Entrepreneur</th>
                  <th className="py-2.5 px-3 bg-blue-50 text-blue-900">Aggregated Geometric Mean</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white font-mono text-xs">
                {expertBreakdown.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3.5 text-left font-sans font-bold text-slate-900">
                      {item.pair}
                    </td>
                    {item.scores.map((s, sIdx) => (
                      <td key={sIdx} className="py-2.5 px-2 text-slate-700">
                        {s}
                      </td>
                    ))}
                    <td className="py-2.5 px-3 bg-blue-50/60 font-bold text-blue-700">
                      {item.gm.toFixed(3)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
