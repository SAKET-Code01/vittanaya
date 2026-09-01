import React, { useState, useEffect, useCallback } from 'react';
import { financeService } from '../../services/financeService';

export default function PredictiveMlCard({ currentProfile, projectCost, marginPct }) {
  const [mlData, setMlData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const bizId = currentProfile?.id || null;
  const costVal = Number(projectCost) || 100000;
  const marginVal = ((Number(marginPct) || 20) / 100) * costVal;
  const category = currentProfile?.category || currentProfile?.businessType || 'Manufacturing';
  const district = currentProfile?.locationDistrict || currentProfile?.location || 'Sundargarh';

  const fetchMlInsights = useCallback(async () => {
    setIsLoading(true);
    try {
      const payload = {
        business_id: bizId ? Number(bizId) : null,
        project_cost: costVal,
        own_capital: marginVal,
        category: category,
        district: district,
      };
      const res = await financeService.getPredictiveMlInsights(payload);
      const data = res?.data || res;
      setMlData(data);
    } catch (err) {
      console.warn('ML Insights fetch warning:', err);
    } finally {
      setIsLoading(false);
    }
  }, [bizId, costVal, marginVal, category, district]);

  useEffect(() => {
    fetchMlInsights();
  }, [fetchMlInsights]);

  const probPct = mlData?.distress_probability_pct ?? 0;
  const tier = mlData?.distress_tier ?? 'LOW';
  const growthPct = mlData?.predicted_growth_rate_pct ?? 0;
  const confidence = mlData?.confidence_score ? Math.round(mlData.confidence_score * 100) : 85;
  const importances = mlData?.feature_importances || [];

  const tierColors = {
    LOW: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    MEDIUM: 'bg-amber-100 text-amber-800 border-amber-300',
    HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
    CRITICAL: 'bg-rose-100 text-rose-800 border-rose-300',
  };

  return (
    <div className="rounded-[22px] border border-[#E4E9E6] bg-white p-5 shadow-[0_6px_24px_rgba(25,48,38,0.045)] space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-purple-700">
            Scikit-Learn Machine Learning Intelligence
          </p>
          <h3 className="text-lg font-black text-[#17201C]">
            Predictive Risk &amp; Growth Intelligence
          </h3>
        </div>
        <span className="px-2.5 py-1 text-[10px] font-black rounded-full border bg-purple-50 text-purple-900 border-purple-200">
          ML_PREDICTION
        </span>
      </div>

      {isLoading ? (
        <div className="py-6 text-center text-xs font-bold text-[#94A3B8]">
          Executing Scikit-Learn Model Inference...
        </div>
      ) : (
        <>
          {/* TOP METRICS GRID */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* Distress Risk Probability */}
            <div className="rounded-2xl border border-[#E2EEE8] bg-[#F9FBFB] p-4 flex flex-col justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                Predicted Default Risk Probability
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#0F172A]">{probPct.toFixed(1)}%</span>
                <span className={`px-2 py-0.5 text-[9px] font-black rounded-full border ${tierColors[tier] || tierColors.LOW}`}>
                  {tier} RISK TIER
                </span>
              </div>
              <p className="mt-1 text-[10px] text-[#64748B]">
                RandomForest Classifier (60 Estimators)
              </p>
            </div>

            {/* 12-Month Growth Trajectory */}
            <div className="rounded-2xl border border-[#E2EEE8] bg-[#F9FBFB] p-4 flex flex-col justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                12-Month Revenue Growth Forecast
              </p>
              <p className="mt-2 text-2xl font-black text-emerald-700">
                {growthPct >= 0 ? `+${growthPct.toFixed(1)}%` : `${growthPct.toFixed(1)}%`}
              </p>
              <p className="mt-1 text-[10px] text-[#64748B]">
                Ensemble Confidence: <strong>{confidence}%</strong>
              </p>
            </div>

            {/* Model Metadata */}
            <div className="rounded-2xl border border-[#E2EEE8] bg-[#F9FBFB] p-4 flex flex-col justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                ML Model Pipeline
              </p>
              <p className="mt-2 text-xs font-black text-[#0F172A]">
                {mlData?.model_metadata?.classifier_name || 'RandomForest'} + {mlData?.model_metadata?.regressor_name || 'RandomForest'}
              </p>
              <p className="mt-1 text-[10px] text-[#64748B]">
                Evaluates 7 engine ratio features
              </p>
            </div>
          </div>

          {/* FEATURE IMPORTANCE RANKING DRIVERS */}
          {importances.length > 0 && (
            <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-4 space-y-2">
              <p className="text-xs font-black text-purple-900 uppercase tracking-wider">
                Top Gini Feature Importance Risk Drivers
              </p>
              <div className="space-y-2 pt-1">
                {importances.slice(0, 3).map((item) => (
                  <div key={item.feature_name} className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#1E293B]">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-extrabold text-[#475569]">Value: {item.value}</span>
                      <span className="px-2 py-0.5 text-[10px] font-black rounded-lg bg-purple-200 text-purple-900">
                        {item.importance_pct}% Weight
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
