import React, { useState } from 'react';
import SelectedBusinessHeader from '../components/dashboard/SelectedBusinessHeader';
import TopThreeMetricCards from '../components/dashboard/TopThreeMetricCards';
import MarketInsightSection from '../components/dashboard/MarketInsightSection';
import VittanayaInsightsCard from '../components/dashboard/VittanayaInsightsCard';
import FinancialOutlookCard from '../components/dashboard/FinancialOutlookCard';
import PaymentFinancialTrackCard from '../components/dashboard/PaymentFinancialTrackCard';
import FloatingAiButton from '../components/dashboard/FloatingAiButton';
import DashboardFooter from '../components/dashboard/DashboardFooter';
import AskVittanayaModal from '../components/dashboard/AskVittanayaModal';
import BusinessChangeModal from '../components/common/BusinessChangeModal';
import { useWorkspace } from '../context/WorkspaceContext';

/**
 * DashboardPage Component — SIH26091 Decision-Support Dashboard
 */
export default function DashboardPage({
  currentProfile,
  onNavigate,
  onOpenWhy,
}) {
  const { financialSummary, financialData, updateProfile } = useWorkspace();
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isChangeBusinessOpen, setIsChangeBusinessOpen] = useState(false);

  // Dynamic Profile and Metric Defaults
  const profile = {
    ...currentProfile,
    name: currentProfile?.name || 'Transport & Logistics',
    category: currentProfile?.category || 'Transport & Logistics',
    location: currentProfile?.location || 'Indore, Madhya Pradesh',
    investmentRange: currentProfile?.investmentRange || '₹8L – ₹45L',
    assessmentDate: currentProfile?.assessmentDate || '17 May 2025',
  };

  const topMetrics = {
    score: 78,
    feasibilityStatus: 'Good Feasibility',
    opportunityLevel: 'High',
    opportunitySummary: 'Strong demand in local market',
    riskLevel: 'Low',
    riskSummary: 'Stable environment',
  };

  const financialOutlookData = {
    projectCost: '₹ 14.50 L',
    ownCapital: '₹ 2.20 L',
    ownCapitalPct: '(15%)',
    loanAmount: '₹ 12.30 L',
    outstandingLoan: '₹ 11.85 L',
    outstandingLoanPct: '(96% of loan)',
    emiMonthly: '₹ 24,500',
    interestRate: '9.25% p.a.',
  };

  const paymentTrackData = {
    moneyIn: '₹ 1,85,000',
    moneyOut: '₹ 1,22,750',
    upcomingDue: '₹ 48,750',
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-4 sm:space-y-5 animate-fadeIn pb-6">
      
      {/* 1. Selected Business Header */}
      <SelectedBusinessHeader
        currentProfile={profile}
        onOpenChangeBusiness={() => setIsChangeBusinessOpen(true)}
      />

      {/* 2. Top 3 Metric Cards Row */}
      <TopThreeMetricCards
        metricsData={topMetrics}
        onOpenDetails={onNavigate}
      />

      {/* 3. Middle Row: Market Insight (Left ~65%) & Vittanaya Insights (Right ~35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
        
        {/* Left: Market Insight (Interactive 3D Map + Why This Opportunity) */}
        <div className="lg:col-span-8 flex flex-col">
          <MarketInsightSection
            currentProfile={profile}
            onNavigate={onNavigate}
            className="flex-1"
          />
        </div>

        {/* Right: Vittanaya Insights (4 Actionable Insight Rows) */}
        <div className="lg:col-span-4 flex flex-col">
          <VittanayaInsightsCard
            currentProfile={profile}
            onNavigate={onNavigate}
            className="flex-1"
          />
        </div>

      </div>

      {/* 4. Bottom Row: Financial Outlook & Payment & Financial Track */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
        
        {/* Left Card: A. Financial Outlook (Loan & Bank) */}
        <div className="lg:col-span-6 flex flex-col">
          <FinancialOutlookCard
            financialData={financialOutlookData}
            onNavigate={onNavigate}
            className="flex-1"
          />
        </div>

        {/* Right Card: Payment & Financial Track (All Money Flow) */}
        <div className="lg:col-span-6 flex flex-col">
          <PaymentFinancialTrackCard
            paymentData={paymentTrackData}
            onNavigate={onNavigate}
            className="flex-1"
          />
        </div>

      </div>

      {/* 5. Footer */}
      <DashboardFooter lastUpdated="17 May 2025 10:30 AM" />

      {/* 6. Floating AI Chatbot Button (~50px up from bottom-right) */}
      <FloatingAiButton onClick={() => setIsAiModalOpen(true)} />

      {/* 7. Interactive Modals */}
      <AskVittanayaModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        currentProfile={profile}
        financialSummary={financialSummary}
      />

      <BusinessChangeModal
        isOpen={isChangeBusinessOpen}
        onClose={() => setIsChangeBusinessOpen(false)}
        currentProfile={profile}
        onSelectBusiness={(newProfile) => {
          if (updateProfile) updateProfile(newProfile);
        }}
      />

    </div>
  );
}
