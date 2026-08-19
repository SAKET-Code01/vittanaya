import React, { useState } from 'react';
import { MOCK_DASHBOARD_SUMMARY } from '../mocks/dashboardMockData';
import FinancialSnapshot from '../components/dashboard/FinancialSnapshot';
import CashFlowChart from '../components/dashboard/CashFlowChart';
import FinancialHealthPanel from '../components/dashboard/FinancialHealthPanel';
import AttentionFeed from '../components/dashboard/AttentionFeed';
import FinancialSummaryBar from '../components/dashboard/FinancialSummaryBar';
import ExpandedForecastModal from '../components/dashboard/ExpandedForecastModal';
import ExplainScoreModal from '../components/dashboard/ExplainScoreModal';
import CustomizeDashboardModal from '../components/dashboard/CustomizeDashboardModal';
import DetailModal from '../components/dashboard/DetailModal';
import { useWorkspace } from '../context/WorkspaceContext';

/**
 * Universal & Adaptive Executive Dashboard Page — STRICT REFERENCE 2 IMPLEMENTATION
 * 
 * Strict Structure:
 * 1. Top Section: 4 Primary KPI Cards (Cash Available, Receivables, Payables, Cash Runway)
 * 2. Middle Section:
 *    - Left (8 cols): Hero Cash Flow Forecast (30D/60D/90D, Closing Balance, Inflow, Outflow, Safety Buffer, Lowest point pin)
 *    - Right (4 cols):
 *        - Top: Financial Health (Circular Gauge 84/100, Stable, Delayed Payments, Cash Buffer, Expense Pressure)
 *        - Bottom: Needs Attention (3 Alert items: Receivables delay, Lowest point Day 18, Payment concentration)
 * 3. Bottom Section: Financial Snapshot (5 columns: Inflow, Outflow, Liquidity Gap, Net Cash Flow, Lowest Cash)
 * 4. Modals & Overlays: Expand Forecast, Explain Score, Customize Dashboard, Modular Detail Views
 */
export default function DashboardPage({
  currentProfile,
  onOpenWhy,
  onOpenRegister,
  onOpenIndustrySwitcher,
  isCustomizeOpen,
  setIsCustomizeOpen,
  hiddenCards = [],
  setHiddenCards,
}) {
  const { financialSummary, financialData } = useWorkspace();
  const summary = financialSummary || MOCK_DASHBOARD_SUMMARY;

  // Single active three-dot menu state
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Shared forecast horizon state (30D / 60D / 90D)
  const [forecastHorizon, setForecastHorizon] = useState('30D');

  // Modal states
  const [isExpandedForecastOpen, setIsExpandedForecastOpen] = useState(false);
  const [isExplainScoreOpen, setIsExplainScoreOpen] = useState(false);
  const [detailModalState, setDetailModalState] = useState({
    isOpen: false,
    type: 'cash-overview',
    data: null,
  });

  // Card Hide & Restore Handlers
  const handleHideCard = (cardId) => {
    setHiddenCards((prev) => (prev.includes(cardId) ? prev : [...prev, cardId]));
  };

  const handleToggleCardVisibility = (cardId) => {
    setHiddenCards((prev) =>
      prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
    );
  };

  const handleResetAllCards = () => {
    setHiddenCards([]);
  };

  const handleOpenDetail = (type, data = null) => {
    setDetailModalState({
      isOpen: true,
      type,
      data,
    });
  };

  // Section visibility flags
  const showForecast = !hiddenCards.includes('chart-forecast');
  const showHealth = !hiddenCards.includes('panel-health');
  const showAttentionFeed = !hiddenCards.includes('feed-attention');
  const showSummaryBar = !hiddenCards.includes('sec-summary');

  return (
    <div className="space-y-6 animate-fadeIn pb-6">
      
      {/* 1. Top Section: 4 Primary KPI Cards (Reference 2) */}
      <FinancialSnapshot
        summary={summary}
        onOpenDetail={handleOpenDetail}
        hiddenCards={hiddenCards}
        onHideCard={handleHideCard}
        activeMenuId={activeMenuId}
        setActiveMenuId={setActiveMenuId}
      />

      {/* 2. Middle Section: Cash Flow Forecast (Left) + Financial Health & Needs Attention (Right) */}
      {(showForecast || showHealth || showAttentionFeed) && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* Left: Cash Flow Forecast Hero Card (8 cols) */}
          {showForecast && (
            <div className={showHealth || showAttentionFeed ? 'lg:col-span-8 flex flex-col' : 'lg:col-span-12 flex flex-col'}>
              <CashFlowChart
                currentProfile={currentProfile}
                horizon={forecastHorizon}
                setHorizon={setForecastHorizon}
                onExpandForecast={() => setIsExpandedForecastOpen(true)}
                onOpenDetail={handleOpenDetail}
                onHideCard={handleHideCard}
                activeMenuId={activeMenuId}
                setActiveMenuId={setActiveMenuId}
              />
            </div>
          )}

          {/* Right Column: Financial Health + Needs Attention (4 cols) */}
          {(showHealth || showAttentionFeed) && (
            <div className={showForecast ? 'lg:col-span-4 flex flex-col space-y-5' : 'lg:col-span-12 flex flex-col space-y-5'}>
              {/* Financial Health */}
              {showHealth && (
                <div className="flex-1">
                  <FinancialHealthPanel
                    currentProfile={currentProfile}
                    summary={summary}
                    onExplainScore={() => setIsExplainScoreOpen(true)}
                    onOpenDetail={handleOpenDetail}
                    onHideCard={handleHideCard}
                    activeMenuId={activeMenuId}
                    setActiveMenuId={setActiveMenuId}
                  />
                </div>
              )}

              {/* Needs Attention */}
              {showAttentionFeed && (
                <div className="flex-1">
                  <AttentionFeed
                    onOpenDetail={handleOpenDetail}
                    onHideCard={handleHideCard}
                    activeMenuId={activeMenuId}
                    setActiveMenuId={setActiveMenuId}
                  />
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* 3. Bottom Section: Financial Snapshot 5-Column Summary (Reference 2) */}
      {showSummaryBar && (
        <FinancialSummaryBar summary={summary} onOpenDetail={handleOpenDetail} />
      )}

      {/* ========================================================================= */}
      {/* MODAL OVERLAYS */}
      {/* ========================================================================= */}

      {/* A. Expanded Cash Flow Forecast Modal */}
      <ExpandedForecastModal
        isOpen={isExpandedForecastOpen}
        onClose={() => setIsExpandedForecastOpen(false)}
        horizon={forecastHorizon}
        setHorizon={setForecastHorizon}
        currentProfile={currentProfile}
        onOpenWhy={onOpenWhy}
      />

      {/* B. Financial Health Score Explanation ("Why is your score 84?") */}
      <ExplainScoreModal
        isOpen={isExplainScoreOpen}
        onClose={() => setIsExplainScoreOpen(false)}
      />

      {/* C. Customize Dashboard Modal (Hide & Restore Cards) */}
      <CustomizeDashboardModal
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        hiddenCards={hiddenCards}
        onToggleCardVisibility={handleToggleCardVisibility}
        onResetAll={handleResetAllCards}
      />

      {/* D. Modular Detail Viewer (Cash Overview, Receivables, Payables, Runway, Compare, Export, Settings, Alerts) */}
      <DetailModal
        isOpen={detailModalState.isOpen}
        onClose={() => setDetailModalState((prev) => ({ ...prev, isOpen: false }))}
        type={detailModalState.type}
        currentProfile={currentProfile}
      />

    </div>
  );
}
