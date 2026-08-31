import React, { useMemo, useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';

/**
 * SchemePage — Personalized Government Scheme Matching
 *
 * Design goals:
 * - Keep VITTANAYA's light theme.
 * - Turn large repetitive scheme cards into compact, scannable cards.
 * - Keep "Why Matched?" as the main trust feature.
 * - Allow filtering, selection and side-by-side comparison.
 * - Expand detailed information only when the user asks for it.
 * - No external packages required.
 *
 * Backend note:
 * The matching score, eligibility status, reasons, documents and official
 * portal URL should eventually come from the backend. This file keeps the
 * current demo data structure so the UI can be built/tested independently.
 */

const getTone = (type) => {
  switch (type) {
    case 'amber':
      return {
        badge: 'bg-amber-50 text-amber-800 border-amber-200/80',
        accent: 'text-amber-800',
        soft: 'bg-amber-50/30',
      };
    case 'blue':
    default:
      return {
        badge: 'bg-blue-50 text-blue-700 border-blue-200',
        accent: 'text-blue-700',
        soft: 'bg-blue-50/40',
      };
  }
};

const CheckIcon = ({ className = '' }) => (
  <span
    className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[10px] font-black text-blue-700 ${className}`}
    aria-hidden="true"
  >
    ✓
  </span>
);

const Chevron = ({ open = false }) => (
  <span
    aria-hidden="true"
    className={`inline-block transition-transform duration-200 ${
      open ? 'rotate-180' : ''
    }`}
  >
    ↓
  </span>
);

const Arrow = () => <span aria-hidden="true">→</span>;

const SectionLabel = ({ children }) => (
  <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-blue-600">
    {children}
  </p>
);

const FilterButton = ({ children, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex min-h-9 items-center justify-between gap-2 rounded-xl border px-3 text-xs font-extrabold transition-all ${
      active
        ? 'border-blue-300 bg-blue-50 text-blue-700'
        : 'border-[rgba(226, 232, 240, 0.9)] bg-white text-[#1E293B] hover:bg-[#F8FAF9]'
    }`}
  >
    <span>{children}</span>
    <span aria-hidden="true">⌄</span>
  </button>
);

const MetaBox = ({ label, value, emphasis = 'dark' }) => {
  const valueClass =
    emphasis === 'green'
      ? 'text-[#217A55]'
      : emphasis === 'amber'
      ? 'text-[#C78A17]'
      : 'text-[#0F172A]';

  return (
    <div className="rounded-xl bg-slate-50/80 border border-slate-100 px-3 py-2.5">
      <p className="text-[9px] font-extrabold uppercase tracking-wider text-[#64748B]">
        {label}
      </p>
      <p className={`mt-1 text-[11px] font-black ${valueClass}`}>{value}</p>
    </div>
  );
};

const EligibilityPill = ({ status }) => {
  const isGood = status === 'Likely Eligible';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${
        isGood
          ? 'border-[#CDE9DA] bg-[#F2FBF6] text-[#14815A]'
          : 'border-[#F1DEB5] bg-[#FFFBF1] text-[#B67B16]'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isGood ? 'bg-[#1AA16D]' : 'bg-[#D89C2C]'
        }`}
      />
      {status}
    </span>
  );
};

export default function SchemePage({
  currentProfile: propProfile,
  onNavigateHome,
}) {
  const { currentProfile: contextProfile } = useWorkspace();
  const currentProfile = propProfile || contextProfile;

  const navigateBack =
    onNavigateHome || (() => window.history.back());

  const isEstablished = (currentProfile?.stage || '').toUpperCase() === 'ESTABLISHED';

  const [expandedId, setExpandedId] = useState(isEstablished ? 'pmegp-expansion' : 'pmegp');
  const [activeTab, setActiveTab] = useState('why');
  const [selectedIds, setSelectedIds] = useState(isEstablished ? ['pmegp-expansion'] : ['pmegp']);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('fit');
  const [collateralFilter, setCollateralFilter] = useState('all');
  const [benefitFilter, setBenefitFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [applyScheme, setApplyScheme] = useState(null);
  const [aiOpen, setAiOpen] = useState(false);

  const establishedSchemes = [
    {
      id: 'pmegp-expansion',
      name: 'PMEGP 2nd Financial Assistance for Upgradation of Existing Units',
      shortName: 'PMEGP Upgradation',
      ministry: 'Ministry of MSME',
      badge: 'EXPANSION MATCH • 98% Fit',
      badgeType: 'blue',
      fitScore: 98,
      eligibility: 'Likely Eligible',
      category: 'subsidy',
      subsidy: '15% to 20% Subsidy on Project Cost (up to ₹25 Lakhs)',
      maxCost: '₹ 1,00,00,000 for Manufacturing / ₹ 25,00,000 for Service',
      promoterShare: '10%',
      tenure: '5 to 7 Years with flexible working capital CC/OD',
      collateral: 'Covered under CGTMSE guarantee',
      collateralLevel: 'low',
      features: [
        'Dedicated expansion capital for successful profit-making MSMEs.',
        'Supports automation, CNC machinery addition, and secondary shift scaling.',
        'Subsidized interest rate with government DBT subsidy credit.',
      ],
      reasons: [
        'Existing operational commercial unit with positive operating margins.',
        'Expansion and technology upgradation matches scheme priority.',
        'GST and Udyam registrations satisfy statutory pre-requisites.',
      ],
      documents: [
        'Audited Financial Statements (Last 2 Years)',
        'Detailed Project Report (DPR) for Expansion',
        'GST Returns (GSTR-3B) & Udyam Certificate',
        'Bank Account Statements (12 Months)',
      ],
      process: [
        'Prepare Expansion Detailed Project Report.',
        'Submit online via KVIC PMEGP 2nd Loan Portal.',
        'Bank appraisal & physical verification by DIC/KVIC.',
        'Sanction & release of expansion working capital.',
      ],
      links: [
        'Official PMEGP 2nd Loan Portal',
        'Ministry of MSME Expansion Guidelines',
      ],
      isPrimary: true,
      benefitType: 'subsidy',
    },
    {
      id: 'cgtmse',
      name: 'CGTMSE (Credit Guarantee Scheme for Micro & Small Enterprises)',
      shortName: 'CGTMSE Credit Line',
      ministry: 'Ministry of MSME & SIDBI',
      badge: 'WORKING CAPITAL • 96% Fit',
      badgeType: 'blue',
      fitScore: 96,
      eligibility: 'Likely Eligible',
      category: 'collateral',
      subsidy: 'Credit guarantee coverage up to 85%',
      maxCost: 'Working Capital Line up to ₹ 2,00,00,000',
      promoterShare: 'Standard Bank Norms (15% Margin)',
      tenure: 'Revolving 12-Month Overdraft / CC Facility',
      collateral: '100% Third-party collateral free',
      collateralLevel: 'low',
      features: [
        'Provides working capital credit line without mortgaging personal real estate.',
        'Guarantee fee subsidised under MSME Champions programme.',
      ],
      reasons: [
        'Provides revolving liquidity to bridge customer receivables gap.',
        'Backed by central credit guarantee trust.',
        'Operational cash flow directly supports debt serviceability.',
      ],
      documents: [
        'Udyam Registration Certificate',
        '12-Month GST Reconciliation (GSTR-3B)',
        'Audited Balance Sheet & Profit & Loss',
        'Sanction Application to Principal Bank',
      ],
      process: [
        'Request CGTMSE coverage through lending bank.',
        'Submit credit line proposal and GST filings.',
        'Bank issues sanction letter with CGTMSE endorsement.',
      ],
      links: [
        'CGTMSE Official Portal',
        'SIDBI MSME Credit Facilitation Desk',
      ],
      isPrimary: false,
      benefitType: 'guarantee',
    },
    {
      id: 'mudra-tarun',
      name: 'Pradhan Mantri Mudra Yojana (Tarun Category)',
      shortName: 'MUDRA Tarun',
      ministry: 'Ministry of Finance',
      badge: 'GROWTH CREDIT • 92% Fit',
      badgeType: 'amber',
      fitScore: 92,
      eligibility: 'Likely Eligible',
      category: 'loan',
      subsidy: 'Interest Subvention on prompt quarterly repayment',
      maxCost: '₹ 5,00,000 to ₹ 10,00,000',
      promoterShare: '15%',
      tenure: '5 Years with flexible cash credit / term loan',
      collateral: 'Zero collateral required under Mudra guarantee',
      collateralLevel: 'low',
      features: [
        'Instant digital processing with simplified MSME checklist.',
        'Mudra Card for seamless working capital drawdowns.',
      ],
      reasons: [
        'MSME financing need matches working-capital requirement.',
        'Commercial operating track record satisfies bank credit criteria.',
        'Zero-collateral feature preserves promoter assets.',
      ],
      documents: [
        'Identity / KYC documents',
        'Business proof & GST registration',
        'Banking details (6 Months)',
        'Working capital quotation set',
      ],
      process: [
        'Review lender-specific eligibility.',
        'Prepare KYC and business documents.',
        'Approach participating public/private bank.',
        'Complete credit appraisal and limit activation.',
      ],
      links: [
        'MUDRA Official Information Portal',
        'Participating Public Sector Banks',
      ],
      isPrimary: false,
      benefitType: 'loan',
    },
  ];

  const standardSchemes = [
    {
      id: 'pmegp',
      name: 'PMEGP (Prime Minister Employment Generation Programme)',
      shortName: 'PMEGP',
      ministry: 'Ministry of Micro, Small and Medium Enterprises (MSME)',
      badge: 'TOP MATCH • 98% Fit',
      badgeType: 'blue',
      fitScore: 98,
      eligibility: 'Likely Eligible',
      category: 'subsidy',
      subsidy: 'Up to 35% Margin Money Subsidy',
      maxCost: '₹ 50,00,000 for Manufacturing / ₹ 20,00,000 for Service',
      promoterShare: '5% to 10%',
      tenure: '7 Years with 6–12 months moratorium',
      collateral: 'Collateral-free up to ₹10 Lakhs (CGTMSE)',
      collateralLevel: 'low',
      features: [
        'Direct DBT subsidy credit after physical verification.',
        'Supported through KVIC / KVIB / DIC / State Nodal Banks.',
        'Entrepreneurship Development Programme (EDP) training included.',
      ],
      reasons: [
        'Manufacturing business aligns with the scheme objective.',
        'Project cost sits within the displayed project-cap range.',
        'Promoter contribution falls inside the displayed 5%–10% range.',
        'Location and business profile are available for matching.',
      ],
      documents: [
        'Business registration / identity proof',
        'Project report / DPR',
        'Banking details',
        'Promoter contribution evidence',
      ],
      process: [
        'Review eligibility requirements.',
        'Prepare the DPR and required documents.',
        'Apply through the relevant government / banking channel.',
        'Complete required verification / training steps.',
      ],
      links: [
        'Official scheme portal',
        'KVIC / KVIB / DIC information',
        'Participating bank information',
      ],
      isPrimary: true,
      benefitType: 'subsidy',
    },
    {
      id: 'mudra-tarun',
      name: 'Pradhan Mantri Mudra Yojana (Tarun Scheme)',
      shortName: 'MUDRA Tarun',
      ministry: 'Ministry of Finance',
      badge: 'SECONDARY MATCH • 85% Fit',
      badgeType: 'amber',
      fitScore: 85,
      eligibility: 'Review Required',
      category: 'loan',
      subsidy: 'Interest Subvention on prompt repayment',
      maxCost: '₹ 5,00,000 to ₹ 10,00,000',
      promoterShare: '15%',
      tenure: '5 Years with flexible working capital CC/OD',
      collateral: 'Zero collateral required under Mudra guarantee',
      collateralLevel: 'low',
      features: [
        'Instant digital processing with simplified MSME checklist.',
        'Mudra Card for seamless working capital drawdowns.',
      ],
      reasons: [
        'MSME-style financing need aligns with a working-capital / loan use case.',
        'Displayed scheme range covers part of the current demo financing band.',
        'Zero-collateral language makes it relevant for low-security financing.',
      ],
      documents: [
        'Identity / KYC documents',
        'Business proof',
        'Banking details',
        'Loan-purpose / business documents',
      ],
      process: [
        'Review lender-specific eligibility.',
        'Prepare KYC and business documents.',
        'Approach the participating lender.',
        'Complete credit appraisal and sanction process.',
      ],
      links: [
        'MUDRA / lender information',
        'Participating bank information',
      ],
      isPrimary: false,
      benefitType: 'loan',
    },
    {
      id: 'cgtmse',
      name: 'CGTMSE (Credit Guarantee Fund Trust for MSEs)',
      shortName: 'CGTMSE',
      ministry: 'Ministry of MSME',
      badge: 'COLLATERAL COVER • 100% Fit',
      badgeType: 'blue',
      fitScore: 100,
      eligibility: 'Likely Eligible',
      category: 'collateral',
      subsidy: 'Credit guarantee coverage up to 85%',
      maxCost: 'Up to ₹ 5,00,000',
      promoterShare: 'Standard Bank Norms',
      tenure: 'Synchronized with underlying term loan',
      collateral: '100% Third-party collateral free',
      collateralLevel: 'low',
      features: [
        'Eliminates need for mortgage or property collateral.',
        'Annual guarantee fee supported under MSME ministry.',
      ],
      reasons: [
        'Directly addresses the collateral burden in business financing.',
        'Useful as a credit-guarantee layer alongside an underlying loan.',
        'Relevant when the lender requires additional credit support.',
      ],
      documents: [
        'Business / MSME proof',
        'Identity and KYC documents',
        'Underlying loan documents',
        'Lender-required financial documents',
      ],
      process: [
        'Discuss guarantee coverage with the lender.',
        'Submit the underlying loan application.',
        'Lender assesses and processes the guarantee request.',
        'Complete the lender documentation process.',
      ],
      links: [
        'CGTMSE information',
        'Participating lender information',
      ],
      isPrimary: false,
      benefitType: 'guarantee',
    },
    {
      id: 'muvy',
      name: 'Maharashtra Udyog Vridhhi Yojana (MUVY)',
      shortName: 'MUVY',
      ministry: 'Government of Maharashtra',
      badge: 'POTENTIAL MATCH • 72% Fit',
      badgeType: 'blue',
      fitScore: 72,
      eligibility: 'Review Required',
      category: 'subsidy',
      subsidy: 'Capital Investment Subsidy',
      maxCost: 'As per government notification',
      promoterShare: 'Minimum 25%',
      tenure: 'As per applicable notification / lender terms',
      collateral: 'As per bank requirements',
      collateralLevel: 'standard',
      features: [
        'Potential support for capital investment under applicable conditions.',
        'Eligibility depends on the relevant government notification.',
      ],
      reasons: [
        'State-specific support can be relevant because the current business is in Maharashtra.',
        'Capital investment support may complement the financial plan.',
        'Detailed eligibility needs to be confirmed against the current notification.',
      ],
      documents: [
        'Business registration',
        'Capital investment details',
        'Project report',
        'State-specific supporting documents',
      ],
      process: [
        'Check the current Maharashtra notification.',
        'Validate eligibility with the relevant authority.',
        'Prepare investment and project documents.',
        'Submit through the applicable channel.',
      ],
      links: [
        'Maharashtra government scheme information',
      ],
      isPrimary: false,
      benefitType: 'subsidy',
    },
  ];

  const schemes = isEstablished ? establishedSchemes : standardSchemes;

  const filteredSchemes = useMemo(() => {
    let result = [...schemes];

    if (categoryFilter !== 'all') {
      result = result.filter((scheme) => scheme.category === categoryFilter);
    }

    if (collateralFilter === 'low') {
      result = result.filter((scheme) => scheme.collateralLevel === 'low');
    }

    if (benefitFilter !== 'all') {
      result = result.filter((scheme) => scheme.benefitType === benefitFilter);
    }

    if (sortBy === 'fit') {
      result.sort((a, b) => b.fitScore - a.fitScore);
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [categoryFilter, collateralFilter, benefitFilter, sortBy]);

  const selectedSchemes = schemes.filter((scheme) =>
    selectedIds.includes(scheme.id)
  );

  const lowCollateralCount = schemes.filter(
    (scheme) => scheme.collateralLevel === 'low'
  ).length;

  const toggleExpanded = (id) => {
    setExpandedId((current) => (current === id ? null : id));
    setActiveTab('why');
  };

  const toggleSelected = (id) => {
    setSelectedIds((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }

      if (current.length >= 3) {
        return current;
      }

      return [...current, id];
    });
  };

  const handleTab = (schemeId, tab) => {
    setExpandedId(schemeId);
    setActiveTab(tab);
  };

  const resetFilters = () => {
    setCategoryFilter('all');
    setSortBy('fit');
    setCollateralFilter('all');
    setBenefitFilter('all');
  };

  const tabs = [
    { id: 'why', label: 'Why Matched?' },
    { id: 'guidelines', label: 'Key Guidelines' },
    { id: 'eligibility', label: 'Eligibility' },
    { id: 'documents', label: 'Documents' },
    { id: 'process', label: 'Application Process' },
    { id: 'links', label: 'Important Links' },
  ];

  const tabContent = (scheme) => {
    switch (activeTab) {
      case 'guidelines':
        return (
          <div className="rounded-2xl border border-[rgba(226, 232, 240, 0.9)] bg-[#FBFCFB] p-4">
            <p className="text-xs font-black text-[#1B2922]">
              Key Scheme Guidelines
            </p>
            <ul className="mt-3 space-y-2">
              {scheme.features.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-[11px] leading-5 text-[#526158]"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#27835C]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        );

      case 'eligibility':
        return (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#D7EBDD] bg-blue-50/40 p-4">
              <p className="text-xs font-black text-[#217954]">
                Current matching status
              </p>
              <div className="mt-2">
                <EligibilityPill status={scheme.eligibility} />
              </div>
              <p className="mt-2 text-[10px] leading-4 text-[#5F7067]">
                This is the current VITTANAYA screening state. Final eligibility
                must be confirmed against the scheme's current rules and the
                lender / authority review.
              </p>
            </div>

            <div className="rounded-2xl border border-[#E7EBE9] bg-white p-4">
              <p className="text-xs font-black text-[#1B2922]">
                Important checks
              </p>
              <ul className="mt-2 space-y-2">
                {scheme.reasons.slice(0, 3).map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-[10px] leading-4 text-[#59675F]"
                  >
                    <CheckIcon className="mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );

      case 'documents':
        return (
          <div className="rounded-2xl border border-[rgba(226, 232, 240, 0.9)] bg-white p-4">
            <p className="text-xs font-black text-[#1B2922]">
              Documents to prepare
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {scheme.documents.map((item, index) => (
                <div
                  key={item}
                  className="flex items-center gap-2 rounded-xl bg-transparent px-3 py-2.5"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-[10px] font-black text-[#0C815B]">
                    {index + 1}
                  </span>
                  <span className="text-[10px] font-bold text-[#526158]">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'process':
        return (
          <div className="rounded-2xl border border-[rgba(226, 232, 240, 0.9)] bg-white p-4">
            <p className="text-xs font-black text-[#1B2922]">
              Application Process
            </p>
            <div className="mt-3 space-y-2.5">
              {scheme.process.map((item, index) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EEF8F3] text-[10px] font-black text-[#0C815B]">
                    {index + 1}
                  </span>
                  <p className="pt-1 text-[11px] leading-4 text-[#526158]">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'links':
        return (
          <div className="rounded-2xl border border-[rgba(226, 232, 240, 0.9)] bg-white p-4">
            <p className="text-xs font-black text-[#1B2922]">
              Important Links
            </p>
            <div className="mt-3 space-y-2">
              {scheme.links.map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-xl bg-transparent px-3 py-2.5"
                >
                  <span className="text-[10px] font-bold text-[#526158]">
                    {item}
                  </span>
                  <span className="text-xs font-black text-[#0C815B]">
                    ↗
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.05fr_1fr]">
            <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4">
              <p className="text-xs font-black text-blue-700">
                Why VITTANAYA matched this scheme
              </p>

              <ul className="mt-3 space-y-2.5">
                {scheme.reasons.map((reason) => (
                  <li
                    key={reason}
                    className="flex items-start gap-2 text-[10px] leading-4 text-[#53635A]"
                  >
                    <CheckIcon className="mt-0.5" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 rounded-xl bg-white/80 px-3 py-2.5">
                <p className="text-[9px] font-extrabold uppercase tracking-wider text-[#7D8D84]">
                  Match confidence
                </p>
                <p className="mt-1 text-sm font-black text-blue-700">
                  {scheme.fitScore >= 90
                    ? 'High'
                    : scheme.fitScore >= 80
                    ? 'Good'
                    : 'Review'}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[rgba(226, 232, 240, 0.9)] bg-white p-4">
              <p className="text-xs font-black text-[#1B2922]">
                Key Scheme Guidelines
              </p>

              <ul className="mt-3 space-y-2.5">
                {scheme.features.slice(0, 4).map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-[10px] leading-4 text-[#526158]"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full space-y-5 bg-transparent pb-12 text-[#18211D]">
      {/* HEADER */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold text-[#607267]">
            <button
              type="button"
              onClick={navigateBack}
              className="transition-colors hover:text-[#102A1E]"
            >
              Dashboard
            </button>
            <span>/</span>
            <span className="font-extrabold text-[#18211D]">
              Scheme Matching
            </span>
          </div>

          <h1 className="text-[27px] font-black tracking-tight text-[#17201C] sm:text-[31px]">
            Government Subsidies &amp; Institutional Schemes
          </h1>

          <p className="mt-1 text-xs leading-5 text-[#607267] sm:text-sm">
            Personalized scheme rankings for{' '}
            <strong>
              {currentProfile?.name || 'Your Enterprise'}
            </strong>{' '}
            in {currentProfile?.location || 'India'}.
          </p>
        </div>

        <button
          type="button"
          onClick={navigateBack}
          className="self-start rounded-full border border-[#E4E9E6] bg-white px-4 py-2 text-xs font-extrabold text-[#26332D] shadow-sm transition hover:bg-[#F8FAF9] xl:self-auto"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* SUMMARY */}
      <section className="rounded-[22px] border border-[#E2E9E5] bg-white p-4 shadow-[0_6px_24px_rgba(25,48,38,0.045)]">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.3fr_0.55fr_0.85fr_0.85fr] md:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-700">
              ♧
            </div>
            <div>
              <SectionLabel>Best matches for your business</SectionLabel>
              <p className="mt-1 text-base font-black text-[#1B2922]">
                {schemes.length} schemes matched your profile
              </p>
              <p className="mt-0.5 text-[10px] text-[#708078]">
                Ranked using current workspace profile and demo matching rules.
              </p>
            </div>
          </div>

          <div className="border-l border-[#E7ECE9] pl-4">
            <p className="text-[9px] font-extrabold uppercase tracking-wider text-[#64748B]">
              Top Match
            </p>
            <p className="mt-1 text-2xl font-black text-blue-700">98%</p>
            <p className="text-[10px] text-[#708078]">Best fit score</p>
          </div>

          <div className="border-l border-[#E7ECE9] pl-4">
            <p className="text-[9px] font-extrabold uppercase tracking-wider text-[#64748B]">
              Low-Collateral Options
            </p>
            <p className="mt-1 text-2xl font-black text-[#1B2922]">
              {lowCollateralCount}
            </p>
            <p className="text-[10px] text-[#708078]">Schemes available</p>
          </div>

          <button
            type="button"
            onClick={() => setAiOpen(true)}
            className="rounded-2xl border border-blue-200 bg-blue-50/60 px-4 py-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
          >
            <p className="text-xs font-black text-blue-700">
              Ask AI Advisor <Arrow />
            </p>
            <p className="mt-1 text-[10px] leading-4 text-[#64736B]">
              Get help choosing between matched schemes.
            </p>
          </button>
        </div>
      </section>

      {/* FILTERS */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-extrabold transition ${
              showFilters
                ? 'border-blue-300 bg-blue-50 text-blue-700'
                : 'border-[rgba(226, 232, 240, 0.9)] bg-white text-[#1E293B]'
            }`}
          >
            ⏷ Filter Schemes
            <Chevron open={showFilters} />
          </button>

          <FilterButton
            active={categoryFilter === 'all'}
            onClick={() => setCategoryFilter('all')}
          >
            All Schemes
          </FilterButton>

          <FilterButton
            active={sortBy === 'fit'}
            onClick={() => setSortBy('fit')}
          >
            Highest Fit
          </FilterButton>

          <FilterButton
            active={collateralFilter === 'low'}
            onClick={() =>
              setCollateralFilter((v) => (v === 'low' ? 'all' : 'low'))
            }
          >
            Low Collateral
          </FilterButton>

          <FilterButton
            active={benefitFilter === 'subsidy'}
            onClick={() =>
              setBenefitFilter((v) => (v === 'subsidy' ? 'all' : 'subsidy'))
            }
          >
            Subsidy
          </FilterButton>

          <FilterButton
            active={benefitFilter === 'loan'}
            onClick={() =>
              setBenefitFilter((v) => (v === 'loan' ? 'all' : 'loan'))
            }
          >
            Loan Support
          </FilterButton>

          <button
            type="button"
            disabled={selectedIds.length < 2}
            onClick={() => setComparisonOpen(true)}
            className={`ml-auto inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-extrabold transition ${
              selectedIds.length >= 2
                ? 'border-[#BFD9CA] bg-white text-blue-700 hover:bg-[#F4FBF7]'
                : 'cursor-not-allowed border-[#E8ECEA] bg-white text-[#9AA49F]'
            }`}
          >
            ⇄ Compare ({selectedIds.length})
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[rgba(226, 232, 240, 0.9)] bg-white p-3">
            <span className="mr-1 text-[10px] font-extrabold uppercase tracking-wider text-[#7E8B84]">
              Categories
            </span>

            <button
              type="button"
              onClick={() => setCategoryFilter('subsidy')}
              className={`rounded-lg px-3 py-1.5 text-[10px] font-extrabold ${
                categoryFilter === 'subsidy'
                  ? 'bg-blue-50 text-[#217A55]'
                  : 'bg-[#F5F7F6] text-[#58665E]'
              }`}
            >
              Subsidy
            </button>

            <button
              type="button"
              onClick={() => setCategoryFilter('loan')}
              className={`rounded-lg px-3 py-1.5 text-[10px] font-extrabold ${
                categoryFilter === 'loan'
                  ? 'bg-[#FFF8E7] text-[#B7790C]'
                  : 'bg-[#F5F7F6] text-[#58665E]'
              }`}
            >
              Loan
            </button>

            <button
              type="button"
              onClick={() => setCategoryFilter('collateral')}
              className={`rounded-lg px-3 py-1.5 text-[10px] font-extrabold ${
                categoryFilter === 'collateral'
                  ? 'bg-[#EEF6FF] text-[#3978D4]'
                  : 'bg-[#F5F7F6] text-[#58665E]'
              }`}
            >
              Guarantee
            </button>

            <button
              type="button"
              onClick={() => setSortBy('name')}
              className={`ml-auto rounded-lg px-3 py-1.5 text-[10px] font-extrabold ${
                sortBy === 'name'
                  ? 'bg-[#F0F7F4] text-[#217A55]'
                  : 'bg-[#F5F7F6] text-[#58665E]'
              }`}
            >
              A–Z
            </button>

            <button
              type="button"
              onClick={resetFilters}
              className="rounded-lg px-3 py-1.5 text-[10px] font-extrabold text-blue-700 hover:bg-[#F2FAF6]"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      {/* SCHEME LIST */}
      <section className="space-y-3">
        {filteredSchemes.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-[#D9E2DD] bg-white p-10 text-center">
            <p className="text-base font-black text-[#233029]">
              No schemes match these filters.
            </p>
            <p className="mt-1 text-xs text-[#708078]">
              Try a broader filter set to view the available matches.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 rounded-xl bg-[#0A8D62] px-4 py-2 text-xs font-extrabold text-white"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredSchemes.map((scheme) => {
            const expanded = expandedId === scheme.id;
            const tone = getTone(scheme.badgeType);

            return (
              <article
                key={scheme.id}
                className={`overflow-hidden rounded-[22px] border bg-white transition-all ${
                  scheme.isPrimary
                    ? 'border-[#7FC5A5] shadow-[0_8px_30px_rgba(25,48,38,0.06)]'
                    : 'border-[#E4E9E6] shadow-[0_5px_20px_rgba(25,48,38,0.035)]'
                }`}
              >
                {/* COMPACT CARD HEADER */}
                <div className="p-4 sm:p-5">
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-[auto_minmax(240px,1.55fr)_repeat(4,minmax(100px,0.72fr))_auto] lg:items-center">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(scheme.id)}
                        onChange={() => toggleSelected(scheme.id)}
                        className="h-4 w-4 accent-[#0A8D62]"
                        aria-label={`Select ${scheme.name} for comparison`}
                      />
                    </label>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${tone.badge}`}
                        >
                          {scheme.badge}
                        </span>

                        <EligibilityPill status={scheme.eligibility} />
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleExpanded(scheme.id)}
                        className="mt-2 text-left text-sm font-black leading-5 text-[#17221C] hover:text-blue-700 sm:text-base"
                      >
                        {scheme.name}
                      </button>

                      <p className="mt-0.5 text-[10px] text-[#758279]">
                        {scheme.ministry}
                      </p>
                    </div>

                    <MetaBox
                      label="Subsidy / Benefit"
                      value={scheme.subsidy}
                      emphasis="green"
                    />

                    <MetaBox
                      label="Max Project Cap"
                      value={scheme.maxCost}
                    />

                    <MetaBox
                      label="Own Contribution"
                      value={scheme.promoterShare}
                      emphasis="amber"
                    />

                    <MetaBox
                      label="Collateral"
                      value={scheme.collateral}
                    />

                    <div className="flex items-center justify-between gap-2 lg:block">
                      <button
                        type="button"
                        onClick={() => setApplyScheme(scheme)}
                        className="rounded-xl bg-[#102A1E] px-3.5 py-2.5 text-[10px] font-black text-white transition hover:bg-[#173D2E]"
                      >
                        Apply via Portal ↗
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleExpanded(scheme.id)}
                        className="ml-auto mt-0 rounded-full border border-[#E4E9E6] bg-white px-2.5 py-2 text-xs font-black text-[#516059] transition hover:bg-transparent lg:mt-2 lg:block"
                        aria-label={`${expanded ? 'Collapse' : 'Expand'} ${scheme.name}`}
                      >
                        <Chevron open={expanded} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* EXPANDED DETAILS */}
                {expanded && (
                  <div className="border-t border-[#E9EEEB] bg-[#FCFDFC]">
                    <div className="overflow-x-auto border-b border-[#E8EDEB] px-4 pt-3 sm:px-5">
                      <div className="flex min-w-max gap-5">
                        {tabs.map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => handleTab(scheme.id, tab.id)}
                            className={`relative pb-3 text-[10px] font-extrabold ${
                              activeTab === tab.id
                                ? 'text-blue-700'
                                : 'text-[#68766E] hover:text-[#1D2A24]'
                            }`}
                          >
                            {tab.label}
                            {activeTab === tab.id && (
                              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#0A8D62]" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 sm:p-5">
                      {tabContent(scheme)}
                    </div>
                  </div>
                )}
              </article>
            );
          })
        )}
      </section>

      {/* BOTTOM ACTIONS */}
      <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-[22px] border border-[#DCEBE3] bg-blue-50/40 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl text-[#16825A] shadow-sm">
              ⇄
            </div>
            <div className="min-w-0 flex-1">
              <SectionLabel>Compare schemes side-by-side</SectionLabel>
              <p className="mt-1 text-sm font-black text-[#1F2C25]">
                Select 2–3 schemes to compare.
              </p>
              <p className="mt-1 text-[10px] leading-4 text-[#67756D]">
                Compare fit, benefits, contribution, collateral and eligibility
                without switching between cards.
              </p>
              <button
                type="button"
                disabled={selectedIds.length < 2}
                onClick={() => setComparisonOpen(true)}
                className={`mt-3 rounded-xl border px-3.5 py-2 text-[10px] font-extrabold ${
                  selectedIds.length >= 2
                    ? 'border-[#BBDDCB] bg-white text-blue-700'
                    : 'cursor-not-allowed border-[#DCE6E1] bg-white text-[#99A49E]'
                }`}
              >
                Compare Schemes <Arrow />
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-[22px] border border-[#DCEBE3] bg-[#F6FBF9] p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl text-[#16825A] shadow-sm">
              ✦
            </div>
            <div className="min-w-0 flex-1">
              <SectionLabel>Need help choosing?</SectionLabel>
              <p className="mt-1 text-sm font-black text-[#1F2C25]">
                Ask VITTANAYA AI Advisor.
              </p>
              <p className="mt-1 text-[10px] leading-4 text-[#67756D]">
                Get a personalized explanation using the selected business and
                scheme context.
              </p>
              <button
                type="button"
                onClick={() => setAiOpen(true)}
                className="mt-3 rounded-xl border border-[#BBDDCB] bg-white px-3.5 py-2 text-[10px] font-extrabold text-blue-700"
              >
                Ask AI Advisor <Arrow />
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="rounded-xl border border-[#DCE7F3] bg-[#F4F8FC] px-4 py-3 text-[10px] leading-4 text-[#627281]">
        Scheme details shown in the demo are indicative. Final eligibility,
        benefit, limits, documents and application process should be confirmed
        against the current official scheme / lender information before
        applying.
      </div>

      {/* APPLY MODAL */}
      {applyScheme && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#102A1E]/35 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-label="Apply via portal confirmation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setApplyScheme(null);
            }
          }}
        >
          <div className="w-full max-w-md rounded-[24px] bg-white p-5 shadow-2xl sm:p-6">
            <SectionLabel>Application</SectionLabel>
            <h2 className="mt-1 text-xl font-black text-[#18211D]">
              Continue to scheme portal
            </h2>
            <p className="mt-2 text-xs leading-5 text-[#68766E]">
              You selected <strong>{applyScheme.shortName}</strong>. In the
              production version, this action should open the official portal
              URL returned by the backend.
            </p>

            <div className="mt-4 rounded-2xl bg-[#F5FAF7] p-4">
              <p className="text-xs font-black text-[#17221C]">
                What VITTANAYA should pass forward
              </p>
              <div className="mt-2 space-y-1.5 text-[10px] text-[#5F7067]">
                <p>• Business profile / business ID</p>
                <p>• Selected scheme ID</p>
                <p>• Current eligibility state</p>
                <p>• Relevant supporting documents</p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setApplyScheme(null)}
                className="rounded-xl border border-[#E3E8E5] px-4 py-2.5 text-xs font-extrabold text-[#55645C]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setApplyScheme(null)}
                className="rounded-xl bg-[#102A1E] px-4 py-2.5 text-xs font-extrabold text-white"
              >
                Continue ↗
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPARE MODAL */}
      {comparisonOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#102A1E]/35 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-label="Compare schemes"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setComparisonOpen(false);
            }
          }}
        >
          <div className="max-h-[88vh] w-full max-w-5xl overflow-auto rounded-[24px] bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <SectionLabel>Side-by-side comparison</SectionLabel>
                <h2 className="mt-1 text-xl font-black">
                  Compare Selected Schemes
                </h2>
                <p className="mt-1 text-xs text-[#6D7B73]">
                  Compare up to three matched options at a glance.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setComparisonOpen(false)}
                className="rounded-full border border-[#E3E8E5] px-3 py-1.5 text-xs font-extrabold text-[#55645C]"
              >
                Close
              </button>
            </div>

            <div className="mt-5 overflow-x-auto rounded-2xl border border-[rgba(226, 232, 240, 0.9)]">
              <table className="min-w-[760px] w-full border-collapse text-left">
                <thead>
                  <tr className="bg-[#F5F8F6]">
                    <th className="w-44 px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-[#75837A]">
                      Attribute
                    </th>
                    {selectedSchemes.map((scheme) => (
                      <th
                        key={scheme.id}
                        className="px-4 py-3 text-xs font-black text-[#18211D]"
                      >
                        {scheme.shortName}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {[
                    ['Fit Score', (scheme) => `${scheme.fitScore}%`],
                    ['Eligibility', (scheme) => scheme.eligibility],
                    ['Benefit', (scheme) => scheme.subsidy],
                    ['Project Cap', (scheme) => scheme.maxCost],
                    ['Own Contribution', (scheme) => scheme.promoterShare],
                    ['Collateral', (scheme) => scheme.collateral],
                    ['Tenure', (scheme) => scheme.tenure],
                  ].map(([label, getter]) => (
                    <tr key={label} className="border-t border-[#E9EEEB]">
                      <td className="px-4 py-3 text-[10px] font-extrabold text-[#68766E]">
                        {label}
                      </td>
                      {selectedSchemes.map((scheme) => (
                        <td
                          key={scheme.id}
                          className="px-4 py-3 text-[10px] font-bold leading-4 text-[#37453E]"
                        >
                          {getter(scheme)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 rounded-xl bg-blue-50/40 px-3 py-2.5 text-[10px] leading-4 text-[#587064]">
              The comparison is intended to support decisions; final scheme
              terms must be verified from the current official source.
            </div>
          </div>
        </div>
      )}

      {/* AI MODAL */}
      {aiOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#102A1E]/35 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-label="Scheme AI advisor"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setAiOpen(false);
            }
          }}
        >
          <div className="w-full max-w-lg rounded-[24px] bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EDF8F3] text-xl text-[#09825C]">
                ✦
              </div>
              <div className="flex-1">
                <SectionLabel>VITTANAYA AI Advisor</SectionLabel>
                <h2 className="mt-1 text-xl font-black">
                  Choosing the right scheme
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setAiOpen(false)}
                className="rounded-full border border-[#E3E8E5] px-3 py-1.5 text-xs font-extrabold text-[#55645C]"
              >
                Close
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-[#E3EAE7] bg-[#FAFCFB] p-4">
              <p className="text-xs font-black text-[#18211D]">
                Demo guidance
              </p>
              <p className="mt-2 text-[11px] leading-5 text-[#5E6D65]">
                Based on the current demo ranking, <strong>PMEGP</strong> is
                the highest-fit displayed option. <strong>CGTMSE</strong> is
                valuable where collateral support is the main concern, while
                <strong> MUDRA</strong> is a loan-oriented alternative.
              </p>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {schemes.slice(0, 3).map((scheme) => (
                <div
                  key={scheme.id}
                  className="rounded-xl border border-[rgba(226, 232, 240, 0.9)] bg-white p-3"
                >
                  <p className="text-[10px] font-black text-[#18211D]">
                    {scheme.shortName}
                  </p>
                  <p className="mt-1 text-[10px] text-[#68766E]">
                    {scheme.fitScore}% fit
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-4 text-[10px] leading-4 text-[#7A8880]">
              Production version: connect this modal to the existing VITTANAYA
              AI endpoint so the response uses the current business profile,
              financial plan, feasibility result and scheme dataset.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
