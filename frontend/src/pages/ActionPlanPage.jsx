import React, { useEffect, useMemo, useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { actionPlanService } from '../services/actionPlanService';

/*
 * VITTANAYA
 * Action Plan — Premium Business Execution Roadmap
 *
 * No external icon library required.
 * All icons are simple inline SVG components.
 */

const Icon = ({ children, size = 18, strokeWidth = 1.8, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

const CheckIcon = ({ size = 18 }) => (
  <Icon size={size}>
    <path d="M5 12.5L9.2 16.5L19 6.8" />
  </Icon>
);

const ChevronDown = ({ size = 18 }) => (
  <Icon size={size}>
    <path d="M6 9L12 15L18 9" />
  </Icon>
);

const ChevronUp = ({ size = 18 }) => (
  <Icon size={size}>
    <path d="M6 15L12 9L18 15" />
  </Icon>
);

const ArrowRight = ({ size = 17 }) => (
  <Icon size={size}>
    <path d="M5 12H18" />
    <path d="M13 7L18 12L13 17" />
  </Icon>
);

const ArrowLeft = ({ size = 17 }) => (
  <Icon size={size}>
    <path d="M19 12H6" />
    <path d="M11 7L6 12L11 17" />
  </Icon>
);

const CalendarIcon = ({ size = 17 }) => (
  <Icon size={size}>
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M16 3V7" />
    <path d="M8 3V7" />
    <path d="M3 10H21" />
  </Icon>
);

const DocumentIcon = ({ size = 18 }) => (
  <Icon size={size}>
    <path d="M7 3H14L19 8V21H7C5.9 21 5 20.1 5 19V5C5 3.9 5.9 3 7 3Z" />
    <path d="M14 3V8H19" />
    <path d="M9 13H15" />
    <path d="M9 17H15" />
  </Icon>
);

const TargetIcon = ({ size = 20 }) => (
  <Icon size={size}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="1.3" fill="currentColor" />
    <path d="M19 5L21 3" />
    <path d="M18 3H21V6" />
  </Icon>
);

const SparkIcon = ({ size = 18 }) => (
  <Icon size={size}>
    <path d="M12 3L13.5 8.5L19 10L13.5 11.5L12 17L10.5 11.5L5 10L10.5 8.5L12 3Z" />
  </Icon>
);

const HeartIcon = ({ size = 19 }) => (
  <Icon size={size}>
    <path d="M20.8 8.7C20.8 14.1 12 20 12 20S3.2 14.1 3.2 8.7C3.2 5.7 5.4 3.5 8.1 3.5C9.8 3.5 11.2 4.3 12 5.6C12.8 4.3 14.2 3.5 15.9 3.5C18.6 3.5 20.8 5.7 20.8 8.7Z" />
  </Icon>
);

const ChartIcon = ({ size = 19 }) => (
  <Icon size={size}>
    <path d="M4 19V5" />
    <path d="M4 19H20" />
    <path d="M7 15L10 11L13 13L18 7" />
  </Icon>
);

const FolderIcon = ({ size = 19 }) => (
  <Icon size={size}>
    <path d="M3 7.5C3 6.4 3.9 5.5 5 5.5H9L11 7.5H19C20.1 7.5 21 8.4 21 9.5V18.5C21 19.6 20.1 20.5 19 20.5H5C3.9 20.5 3 19.6 3 18.5V7.5Z" />
    <path d="M3 10H21" />
  </Icon>
);

const ExternalIcon = ({ size = 15 }) => (
  <Icon size={size}>
    <path d="M14 5H19V10" />
    <path d="M19 5L11 13" />
    <path d="M19 14V18C19 19.1 18.1 20 17 20H6C4.9 20 4 19.1 4 18V7C4 5.9 4.9 5 6 5H10" />
  </Icon>
);

const InfoIcon = ({ size = 17 }) => (
  <Icon size={size}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 10V16" />
    <path d="M12 7.5H12.01" />
  </Icon>
);

const ClockIcon = ({ size = 18 }) => (
  <Icon size={size}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7V12L15.5 14" />
  </Icon>
);

const ShieldIcon = ({ size = 18 }) => (
  <Icon size={size}>
    <path d="M12 3L19 6V11.5C19 16.2 16.2 19.1 12 21C7.8 19.1 5 16.2 5 11.5V6L12 3Z" />
    <path d="M9 12L11.2 14.2L15.5 9.8" />
  </Icon>
);

const LightbulbIcon = ({ size = 18 }) => (
  <Icon size={size}>
    <path d="M9 18H15" />
    <path d="M10 21H14" />
    <path d="M8.2 14.5C7.1 13.5 6.5 12.1 6.5 10.5C6.5 7.5 8.9 5 12 5C15.1 5 17.5 7.5 17.5 10.5C17.5 12.1 16.9 13.5 15.8 14.5C15.1 15.2 15 16.2 15 17H9C9 16.2 8.9 15.2 8.2 14.5Z" />
  </Icon>
);

const ClipboardIcon = ({ size = 20 }) => (
  <Icon size={size}>
    <rect x="5" y="4" width="14" height="17" rx="2" />
    <path d="M9 4.5V3H15V4.5" />
    <path d="M9 10H15" />
    <path d="M9 14H15" />
    <path d="M9 18H12" />
  </Icon>
);


const FlagIcon = ({ size = 19 }) => (
  <Icon size={size}>
    <path d="M6 21V4" />
    <path d="M6 5C9 2.5 12 7.5 18 4V14C12 17.5 9 12.5 6 15" />
  </Icon>
);

const TrendingIcon = ({ size = 19 }) => (
  <Icon size={size}>
    <path d="M4 16L9 11L13 14L20 6" />
    <path d="M15 6H20V11" />
  </Icon>
);

const BoltIcon = ({ size = 19 }) => (
  <Icon size={size}>
    <path d="M13 2L4.5 13H11L10 22L19.5 10H13L13 2Z" />
  </Icon>
);

const BriefcaseIcon = ({ size = 19 }) => (
  <Icon size={size}>
    <rect x="3" y="7" width="18" height="13" rx="3" />
    <path d="M8 7V5.5C8 4.4 8.9 3.5 10 3.5H14C15.1 3.5 16 4.4 16 5.5V7" />
    <path d="M3 12H21" />
    <path d="M10 12V14H14V12" />
  </Icon>
);

const tasksInitial = [
  {
    id: 1,
    phase: 'Phase 1',
    phaseName: 'Legal & Registration',
    title: 'Obtain Udyam MSME Registration Certificate',
    done: true,
    deadline: 'Day 3',
    description:
      'Complete the official MSME registration process and keep the generated certificate ready for future applications.',
    steps: [
      'Complete Udyam registration details.',
      'Verify enterprise and promoter information.',
      'Download and securely store the certificate.',
    ],
    documents: ['Aadhaar / Identity Proof', 'PAN Card', 'Business Details'],
    why: 'Udyam registration establishes your MSME identity and is commonly required when accessing government business support.',
    scheme: 'MSME Registration',
    fit: 'Required',
  },
  {
    id: 2,
    phase: 'Phase 1',
    phaseName: 'Legal & Registration',
    title: 'Local Panchayat / Municipal Trade License NOC',
    done: true,
    deadline: 'Day 7',
    description:
      'Obtain the required local permission or NOC for operating the proposed business at the selected location.',
    steps: [
      'Identify the applicable local authority.',
      'Submit the required business and location documents.',
      'Collect and store the approval / NOC.',
    ],
    documents: ['Address Proof', 'Business Registration', 'Site Documents'],
    why: 'Local approvals reduce compliance risk before the business moves into financing and setup.',
    scheme: 'Local Compliance',
    fit: 'Required',
  },
  {
    id: 3,
    phase: 'Phase 2',
    phaseName: 'DPR & Banking',
    title: 'Finalize Bankable Detailed Project Report (DPR)',
    done: true,
    deadline: 'Day 12',
    description:
      'Prepare the financial and operational project report required for lender and scheme evaluation.',
    steps: [
      'Finalize project cost and capital structure.',
      'Complete revenue and expense projections.',
      'Review the DPR for bank submission.',
    ],
    documents: ['Detailed Project Report', 'Financial Projections', 'Quotation Set'],
    why: 'A clear DPR gives the bank a structured view of the project, funding requirement and repayment capacity.',
    scheme: 'PMEGP',
    fit: '98% Fit',
  },
  {
    id: 4,
    phase: 'Phase 2',
    phaseName: 'DPR & Banking',
    title: 'Submit PMEGP Online Application via KVIC Portal',
    done: false,
    deadline: 'Day 18',
    current: true,
    description:
      'Submit the PMEGP application with the finalized DPR, KYC and supporting documents through the appropriate portal.',
    steps: [
      'Create or access your KVIC PMEGP account.',
      'Fill in the PMEGP application form.',
      'Upload DPR and required KYC documents.',
      'Submit the application for approval.',
    ],
    documents: [
      'Project Report (DPR)',
      'Udyam Registration Certificate',
      'Identity Proof',
      'Address Proof',
      'Category Certificate (if applicable)',
    ],
    why: 'This is the key application step for accessing the PMEGP margin money subsidy and associated bank financing process.',
    scheme: 'PMEGP',
    fit: '98% Fit',
  },
  {
    id: 5,
    phase: 'Phase 3',
    phaseName: 'Sanction & Margin',
    title: 'Bank Joint Site Inspection & In-Principle Sanction',
    done: false,
    deadline: 'Day 28',
    description:
      'Coordinate with the lender for site verification and preliminary project assessment.',
    steps: [
      'Coordinate the site inspection date.',
      'Keep original project documents ready.',
      'Address bank queries during inspection.',
    ],
    documents: ['DPR', 'Site Proof', 'Business Documents'],
    why: 'The site inspection helps the lender validate the proposed business location and project assumptions.',
    scheme: 'PMEGP',
    fit: '98% Fit',
  },
  {
    id: 6,
    phase: 'Phase 3',
    phaseName: 'Sanction & Margin',
    title: 'Deposit 10% Promoter Margin Capital (₹1,00,000)',
    done: false,
    deadline: 'Day 35',
    description:
      'Arrange and deposit the required promoter contribution according to the sanctioned project structure.',
    steps: [
      'Confirm promoter contribution with the bank.',
      'Maintain sufficient account balance.',
      'Complete the required margin deposit.',
    ],
    documents: ['Bank Statement', 'Promoter Contribution Proof', 'Sanction Documents'],
    why: 'Promoter contribution demonstrates financial participation in the proposed project.',
    scheme: 'PMEGP',
    fit: '98% Fit',
  },
  {
    id: 7,
    phase: 'Phase 4',
    phaseName: 'Setup & Launch',
    title: 'Machinery Procurement & Installation on Site',
    done: false,
    deadline: 'Day 50',
    description:
      'Procure approved machinery and complete installation according to the finalized project plan.',
    steps: [
      'Confirm approved machinery specifications.',
      'Finalize supplier and purchase documents.',
      'Install and test machinery at the site.',
    ],
    documents: ['Supplier Quotations', 'Purchase Invoices', 'Installation Records'],
    why: 'Machinery setup converts the approved project plan into an operational business facility.',
    scheme: 'Project Setup',
    fit: 'Milestone',
  },
  {
    id: 8,
    phase: 'Phase 4',
    phaseName: 'Setup & Launch',
    title: 'Trial Production Run & Commercial Billing Launch',
    done: false,
    deadline: 'Day 60',
    description:
      'Run initial production, validate operations and move into commercial billing.',
    steps: [
      'Complete trial production.',
      'Validate quality and operating process.',
      'Start commercial billing and customer delivery.',
    ],
    documents: ['Production Records', 'Invoices', 'Quality Records'],
    why: 'This milestone marks the transition from business setup to actual commercial operation.',
    scheme: 'Business Launch',
    fit: 'Launch',
  },
];

const phases = [
  {
    id: 1,
    name: 'Legal & Registration',
    short: 'LEGAL',
  },
  {
    id: 2,
    name: 'DPR & Banking',
    short: 'BANKING',
  },
  {
    id: 3,
    name: 'Sanction & Margin',
    short: 'SANCTION',
  },
  {
    id: 4,
    name: 'Setup & Launch',
    short: 'LAUNCH',
  },
];

const establishedPhases = [
  {
    id: 1,
    name: 'Stabilize & Cash Preservation',
    short: 'STABILIZE',
  },
  {
    id: 2,
    name: 'Optimize & Unit Economics',
    short: 'OPTIMIZE',
  },
  {
    id: 3,
    name: 'Scale & Growth Financing',
    short: 'GROW',
  },
];

const establishedTasksInitial = [
  {
    id: 101,
    phase: 'Phase 1',
    phaseName: 'Stabilize & Cash Preservation',
    title: 'Audit Overdue Receivables & Factor Invoices',
    done: true,
    deadline: 'Week 1',
    description:
      'Systematically follow up on 30+ day outstanding customer invoices and activate early discount factoring.',
    steps: [
      'Extract aging analysis for all commercial accounts.',
      'Send formal reconciliation statements and payment reminders.',
      'Negotiate early settlement terms with top 3 corporate clients.',
    ],
    documents: ['Aging Debtors Report', 'Customer Invoices', 'Bank Statements'],
    why: 'Accelerating collections unlocks vital operating liquidity without resorting to high-cost emergency credit.',
    scheme: 'Cash Preservation',
    fit: 'Priority 1',
  },
  {
    id: 102,
    phase: 'Phase 1',
    phaseName: 'Stabilize & Cash Preservation',
    title: 'Statutory GST & Advance Tax Compliance Reconciliation',
    done: true,
    deadline: 'Week 2',
    description:
      'Fulfill all quarterly GSTR-3B filings, input tax credit claims, and local municipal trade license renewals.',
    steps: [
      'Reconcile GSTR-2B input tax credit with purchase ledger.',
      'File monthly/quarterly returns before statutory deadline.',
      'Archive trade license and pollution control NOC compliance certificates.',
    ],
    documents: ['GSTR-3B Acknowledgement', 'Trade License', 'Tax Challans'],
    why: 'Zero statutory default maintains tier-1 credit rating required for institutional working capital facilities.',
    scheme: 'Statutory Compliance',
    fit: 'Required',
  },
  {
    id: 103,
    phase: 'Phase 2',
    phaseName: 'Optimize & Unit Economics',
    title: 'Raw Material Supplier Contract & Price Renegotiation',
    done: false,
    current: true,
    deadline: 'Week 4',
    description:
      'Consolidate supplier purchasing volume to negotiate 45-day credit terms and 4-6% bulk procurement discounts.',
    steps: [
      'Evaluate material price indices and alternative vendors.',
      'Draft standardized quarterly vendor agreements with price locks.',
      'Establish revolving supplier credit accounts.',
    ],
    documents: ['Vendor Quotations', 'Purchase Orders', 'Supplier Master File'],
    why: 'Direct material cost reduction improves gross operating margins by 3.2% across current output volume.',
    scheme: 'Cost Optimization',
    fit: 'Active',
  },
  {
    id: 104,
    phase: 'Phase 2',
    phaseName: 'Optimize & Unit Economics',
    title: 'Machine Preventive Maintenance & Capacity Calibration',
    done: false,
    deadline: 'Week 6',
    description:
      'Calibrate primary production equipment, minimize downtime, and increase single-shift capacity utilization from 65% to 82%.',
    steps: [
      'Conduct comprehensive tooling inspection and servicing.',
      'Implement digital job cards and machine log tracking.',
      'Eliminate bottlenecks in the primary fabrication stage.',
    ],
    documents: ['Maintenance Log', 'Equipment Manuals', 'Tooling Invoices'],
    why: 'Higher machine utilization reduces fixed overhead per unit and accommodates surge order flow.',
    scheme: 'Operational Excellence',
    fit: 'High Impact',
  },
  {
    id: 105,
    phase: 'Phase 3',
    phaseName: 'Scale & Growth Financing',
    title: 'Apply for Pre-Approved CGTMSE Working Capital Loan (₹15L)',
    done: false,
    deadline: 'Week 8',
    description:
      'Submit collateral-free credit facility application to principal bank under Credit Guarantee Scheme for Micro & Small Enterprises.',
    steps: [
      'Collate audited financial statements and 12-month GST returns.',
      'Submit collateral-free credit proposal under CGTMSE framework.',
      'Obtain bank sanction letter and establish revolving overdraft limit.',
    ],
    documents: ['Audited Financials (2 Yrs)', 'GST Returns', 'Sanction Application'],
    why: 'Institutional working capital line fuels second-shift operations without diluting founder equity.',
    scheme: 'CGTMSE Credit Line',
    fit: 'Growth',
  },
  {
    id: 106,
    phase: 'Phase 3',
    phaseName: 'Scale & Growth Financing',
    title: 'Onboard 4 Technical CNC Machinist Apprentices & Expand Shift',
    done: false,
    deadline: 'Week 12',
    description:
      'Recruit skilled technical operators under National Apprenticeship Promotion Scheme (NAPS) to launch two-shift continuous production.',
    steps: [
      'Post apprentice requirements on NAPS / PMKVY portal.',
      'Interview and onboard certified CNC / fabrication machinists.',
      'Initiate secondary evening production shift.',
    ],
    documents: ['Apprenticeship Contracts', 'Staff KYC', 'Shift Schedules'],
    why: 'Double-shift operations doubles revenue throughput while utilizing existing facility infrastructure.',
    scheme: 'Capacity Expansion',
    fit: 'Growth Target',
  },
];

export default function ActionPlanPage({
  currentProfile: propProfile,
  onNavigateHome,
}) {
  const { currentProfile: contextProfile } = useWorkspace();

  const currentProfile = propProfile || contextProfile;
  const isEstablished = (currentProfile?.stage || '').toUpperCase() === 'ESTABLISHED';

  const navigateBack =
    onNavigateHome || (() => window.history.back());

  const [tasks, setTasks] = useState(isEstablished ? establishedTasksInitial : tasksInitial);
  const [expandedId, setExpandedId] = useState(isEstablished ? 103 : 4);
  const [phaseFilter, setPhaseFilter] = useState('All');
  const [showPhaseMenu, setShowPhaseMenu] = useState(false);
  const [isExportingDPR, setIsExportingDPR] = useState(false);
  const [dprSuccessMsg, setDprSuccessMsg] = useState(null);

  const bizId = currentProfile?.id || null;

  useEffect(() => {
    let isMounted = true;
    if (!bizId) return;

    actionPlanService
      .getActionPlan(bizId)
      .then((res) => {
        const data = res?.data || res;
        if (isMounted && data && data.tasks && data.tasks.length > 0) {
          // Merge authoritative backend database tasks
          setTasks((prev) =>
            data.tasks.map((bt, idx) => {
              const staticT = prev[idx] || {};
              return {
                ...staticT,
                id: bt.id,
                backendId: bt.id,
                phase: bt.phase.split(':')[0].trim(),
                phaseName: bt.phase.split(':')[1]?.trim() || bt.phase,
                title: bt.title || staticT.title,
                done: bt.status === 'completed',
                deadline: bt.due_date || (bt.target_days ? `Day ${bt.target_days}` : staticT.deadline),
                description: bt.description || staticT.description,
                steps: staticT.steps || ['Review statutory requirements', 'Compile filings', 'Track acknowledgement'],
                documents: staticT.documents || ['Statutory Filing', 'Acknowledgement Receipt'],
                why: staticT.why || `Required milestone governed by ${bt.authority_name || 'statutory authority'}.`,
                scheme: bt.authority_name || staticT.scheme || 'Compliance Gate',
                fit: bt.priority || 'Mandatory',
              };
            })
          );
        }
      })
      .catch((err) => {
        console.warn('Backend action plan notice:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [bizId]);

  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  const handleExportDPR = async () => {
    if (isExportingDPR) return;

    if (!bizId) {
      alert('Please complete or select an active business profile before generating a DPR package.');
      return;
    }

    setIsExportingDPR(true);
    setDprSuccessMsg(null);
    try {
      const dprPayload = {
        business_id: bizId,
        business_name: currentProfile?.businessName || currentProfile?.name || 'Rural Micro-Enterprise',
        business_category: currentProfile?.category || currentProfile?.businessType || 'Retail & Processing',
        location: currentProfile?.location || currentProfile?.district || 'Odisha',
        indicative_project_cost: Number(currentProfile?.ownCapital ? currentProfile.ownCapital * 10 : 1000000),
        own_margin_capital: Number(currentProfile?.ownCapital || 100000),
        eligible_loan_amount: Number(currentProfile?.ownCapital ? currentProfile.ownCapital * 9 : 900000),
        estimated_subsidy_amount: 0.0,
        scheme_name: 'PMEGP / MUDRA',
      };

      const result = await actionPlanService.exportDPRPackage(dprPayload);
      const data = result?.data || result;
      const jsonStr = JSON.stringify(data.dpr_content || data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.document_name || `DPR_${currentProfile?.businessName || 'Enterprise'}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDprSuccessMsg('Detailed Project Report (DPR) downloaded successfully!');
    } catch (err) {
      console.warn('DPR export notice:', err);
      alert(err.message || 'Could not generate DPR package. Please try again.');
    } finally {
      setIsExportingDPR(false);
    }
  };

  const activePhasesList = isEstablished ? establishedPhases : phases;

  const completedCount = tasks.filter((task) => task.done).length;
  const progressPct = Math.round(
    (completedCount / tasks.length) * 100
  );

  const currentTask =
    tasks.find((task) => task.current && !task.done) ||
    tasks.find((task) => !task.done) ||
    tasks[tasks.length - 1];

  const inProgressCount = tasks.filter(
    (task) => !task.done && task.id === currentTask?.id
  ).length;

  const upcomingCount = tasks.filter(
    (task) => !task.done && task.id !== currentTask?.id
  ).length;

  const overdueCount = 0;

  const activePhaseNumber = Number(
    currentTask?.phase?.replace('Phase ', '') || 1
  );

  const filteredTasks = useMemo(() => {
    if (phaseFilter === 'All') return tasks;

    return tasks.filter((task) => task.phase === phaseFilter);
  }, [tasks, phaseFilter]);

  const toggleTask = async (id) => {
    if (updatingTaskId === id) return;

    const targetTask = tasks.find((t) => t.id === id);
    if (!targetTask) return;

    const newDone = !targetTask.done;
    const newStatus = newDone ? 'completed' : 'pending';

    // Optimistically update UI
    setTasks((previous) =>
      previous.map((task) => (task.id === id ? { ...task, done: newDone } : task))
    );

    if (targetTask.backendId && bizId) {
      setUpdatingTaskId(id);
      try {
        const res = await actionPlanService.updateTaskStatus(targetTask.backendId, newStatus, bizId);
        const resData = res?.data || res;
        if (resData) {
          window.dispatchEvent(
            new CustomEvent('vittanaya-readiness-updated', {
              detail: {
                businessId: bizId,
                readinessScore: resData.readiness_score,
                readinessLabel: resData.readiness_label,
                completionPct: resData.completion_pct,
              },
            })
          );
        }
      } catch (err) {
        console.warn('Task status update error, rolling back:', err);
        // Rollback task state on backend failure
        setTasks((previous) =>
          previous.map((task) => (task.id === id ? { ...task, done: targetTask.done } : task))
        );
        alert(err.message || 'Could not update task status on server. Rolled back.');
      } finally {
        setUpdatingTaskId(null);
      }
    }
  };

  const toggleExpanded = (id) => {
    setExpandedId((previous) => (previous === id ? null : id));
  };

  const getTaskStatus = (task) => {
    if (task.done) return 'Completed';
    if (task.id === currentTask?.id) return 'In Progress';
    return 'Upcoming';
  };

  const getStatusClasses = (task) => {
    const status = getTaskStatus(task);

    if (status === 'Completed') {
      return {
        card: 'border-blue-200/80 bg-gradient-to-r from-blue-50/40 via-white to-blue-50/20',
        node: 'bg-blue-600 text-white border-blue-600 shadow-[0_0_0_5px_rgba(37,99,235,0.12)]',
        badge: 'bg-blue-50 text-blue-700 border-blue-200',
      };
    }

    if (status === 'In Progress') {
      return {
        card: 'border-blue-500 bg-gradient-to-r from-blue-50/50 via-white to-white shadow-[0_18px_50px_rgba(37,99,235,0.08)]',
        node: 'bg-blue-50 text-blue-700 border-blue-600 shadow-[0_0_0_6px_rgba(37,99,235,0.12)]',
        badge: 'bg-blue-600 text-white border-blue-600',
      };
    }

    return {
      card: 'border-slate-200 bg-white hover:border-blue-200 hover:shadow-[0_14px_35px_rgba(15,23,42,0.05)]',
      node: 'bg-white text-slate-500 border-slate-300',
      badge: 'bg-slate-100 text-slate-600 border-slate-200',
    };
  };

  const ringRadius = 54;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset =
    ringCircumference -
    (progressPct / 100) * ringCircumference;

  return (
    <div className="min-h-full w-full bg-transparent text-slate-900">
      <div className="relative mx-auto w-full max-w-[1480px] px-4 pb-16 pt-5 sm:px-6 lg:px-8">

        {/* Decorative background glow */}
        <div className="pointer-events-none absolute left-[12%] top-0 h-64 w-64 rounded-full bg-blue-200/30 opacity-30 blur-3xl" />
        <div className="pointer-events-none absolute right-[8%] top-24 h-72 w-72 rounded-full bg-indigo-100/30 opacity-50 blur-3xl" />

        {/* =========================================================
            PREMIUM HEADER + EXECUTION OVERVIEW
        ========================================================= */}
        <section className="relative mb-8">
          <div className="absolute -left-20 top-4 h-64 w-64 rounded-full bg-blue-100/40 blur-3xl" />
          <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-[#EEF4FF]/80 blur-3xl" />

          <div className="relative mb-6 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="min-w-0">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-2 text-[11px] font-bold text-slate-600 shadow-[0_8px_24px_rgba(15,23,42,0.04)] backdrop-blur">
                <button type="button" onClick={navigateBack} className="transition-colors hover:text-blue-700">
                  Dashboard
                </button>
                <span className="text-[#B2BCB7]">/</span>
                <span className="font-black text-blue-700">Action Plan</span>
              </div>

              <div className="flex items-start gap-4">
                <div className="hidden h-[58px] w-[58px] shrink-0 items-center justify-center rounded-[18px] border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-blue-50/40 text-blue-700 shadow-[0_12px_30px_rgba(37,99,235,0.10)] sm:flex">
                  <FlagIcon size={27} />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-[31px] font-black leading-[1.08] tracking-[-0.045em] text-[#102018] sm:text-[42px]">
                      60-Day Business Execution Roadmap
                    </h1>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] text-blue-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                      Live Plan
                    </span>
                  </div>

                  <p className="mt-3 max-w-3xl text-[14px] leading-6 text-[#65766D] sm:text-[15px]">
                    Turn your business plan into a clear execution path — from registration and funding to setup and commercial launch for{' '}
                    <span className="font-extrabold text-[#25362D]">
                      {currentProfile?.name || 'Apex Precision Engineering'}
                    </span>
                    .
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] font-bold text-[#6E7D75]">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
                      <BriefcaseIcon size={13} />
                      Business launch plan
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
                      <CalendarIcon size={13} />
                      60-day target
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
                      <ShieldIcon size={13} />
                      Milestone-based execution
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleExportDPR}
                disabled={isExportingDPR}
                className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-blue-600 border border-blue-700 px-5 py-3.5 text-xs font-black text-white shadow-[0_10px_28px_rgba(37,99,235,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 disabled:opacity-50"
              >
                <DocumentIcon size={15} />
                {isExportingDPR ? 'Compiling DPR...' : 'Download Bankable DPR'}
              </button>

              <button
                type="button"
                onClick={navigateBack}
                className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-5 py-3.5 text-xs font-black text-[#23352B] shadow-[0_10px_28px_rgba(25,55,40,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_16px_34px_rgba(37,99,235,0.08)]"
              >
                <ArrowLeft size={15} />
                Back to Dashboard
              </button>
            </div>
          </div>

          {/* Premium execution overview */}
          <div className="relative overflow-hidden rounded-[30px] border border-slate-200/80 bg-white shadow-[0_18px_60px_rgba(24,62,43,0.075)]">
            <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-blue-100/30 opacity-80 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-[34%] h-56 w-56 rounded-full bg-[#EEF5FF] opacity-60 blur-3xl" />

            <div className="relative grid lg:grid-cols-[1.1fr_0.9fr]">
              <div className="border-b border-slate-100 p-6 sm:p-8 lg:border-b-0 lg:border-r">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                      <TrendingIcon size={21} />
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-blue-700">Execution progress</p>
                      <p className="mt-0.5 text-xs text-[#78877F]">Your roadmap is moving toward launch</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[10px] font-black text-blue-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                    On Track
                  </span>
                </div>

                <div className="mt-7 flex items-end justify-between gap-6">
                  <div>
                    <div className="flex items-end gap-3">
                      <span className="text-[66px] font-black leading-none tracking-[-0.065em] text-blue-700">{progressPct}%</span>
                      <span className="pb-2 text-sm font-extrabold text-[#34473D]">complete</span>
                    </div>
                    <p className="mt-3 text-xs font-medium text-[#7A8981]">
                      {completedCount} of {tasks.length} milestones completed
                    </p>
                  </div>

                  <div className="hidden text-right sm:block">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#8A9791]">Target</p>
                    <p className="mt-1 text-2xl font-black tracking-[-0.03em] text-[#17271E]">Day 60</p>
                    <p className="mt-0.5 text-[10px] font-semibold text-[#849189]">Commercial launch</p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between text-[10px] font-bold text-[#728179]">
                    <span>Roadmap completion</span>
                    <span>{progressPct}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-[#ECF2EE] p-[2px]">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-700 via-blue-600 to-sky-400 shadow-[0_3px_12px_rgba(37,99,235,0.25)] transition-all duration-700" style={{ width: `${progressPct}%` }} />
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { value: completedCount, label: 'Completed', tone: 'blue', icon: CheckIcon },
                    { value: inProgressCount, label: 'In Progress', tone: 'amber', icon: ClockIcon },
                    { value: upcomingCount, label: 'Upcoming', tone: 'slate', icon: ArrowRight },
                    { value: overdueCount, label: 'Overdue', tone: 'red', icon: InfoIcon },
                  ].map((stat) => {
                    const IconComponent = stat.icon;
                    const tone = stat.tone === 'blue'
                      ? 'border-blue-200 bg-blue-50 text-blue-700'
                      : stat.tone === 'amber'
                      ? 'border-amber-200 bg-amber-50 text-amber-800'
                      : stat.tone === 'slate'
                      ? 'border-slate-200 bg-slate-50 text-slate-700'
                      : 'border-rose-200 bg-rose-50 text-rose-700';
                    return (
                      <div key={stat.label} className={`rounded-2xl border p-3.5 ${tone}`}>
                        <div className="mb-3 flex h-7 w-7 items-center justify-center rounded-lg bg-white shadow-sm">
                          <IconComponent size={14} />
                        </div>
                        <p className="text-xl font-black leading-none">{stat.value}</p>
                        <p className="mt-1.5 text-[9px] font-extrabold opacity-70">{stat.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="relative p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF5E7] text-[#C87808]">
                      <TargetIcon size={21} />
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#C87808]">Next milestone</p>
                      <p className="mt-0.5 text-xs text-[#78877F]">Your highest-priority action right now</p>
                    </div>
                  </div>
                  <span className="rounded-full border border-[#F0D39E] bg-[#FFF9EF] px-3 py-1.5 text-[10px] font-black text-[#B96C00]">In Progress</span>
                </div>

                <div className="mt-6 rounded-[24px] border border-blue-100 bg-gradient-to-br from-blue-50/40 via-white to-white p-5 shadow-[0_12px_35px_rgba(37,99,235,0.07)]">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)]">
                      <DocumentIcon size={22} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-blue-700">{currentTask.phase} · {currentTask.phaseName}</p>
                      <h2 className="mt-1.5 text-[17px] font-black leading-6 tracking-[-0.025em] text-[#14231B]">{currentTask.title}</h2>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1.5 text-[10px] font-black text-blue-700 shadow-sm">
                          <CalendarIcon size={12} /> {currentTask.deadline}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1.5 text-[10px] font-bold text-[#687970] shadow-sm">
                          <BoltIcon size={12} /> Priority action
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => {
                        setExpandedId(currentTask.id);
                        document.getElementById(`milestone-${currentTask.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-black text-white shadow-[0_4px_14px_rgba(37,99,235,0.25)] transition-all hover:-translate-y-0.5 hover:bg-blue-700"
                    >
                      Open Milestone <ArrowRight size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleTask(currentTask.id)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-3 text-xs font-black text-blue-700 transition-all hover:-translate-y-0.5 hover:bg-blue-50"
                    >
                      <CheckIcon size={14} /> Mark Complete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            PHASE JOURNEY
        ========================================================= */}
        <section className="relative mb-7 overflow-hidden rounded-[26px] border border-[#DDE7E1] bg-white shadow-[0_10px_35px_rgba(24,62,43,0.05)]">
          <div className="flex flex-col justify-between gap-4 border-b border-[#EDF1EE] px-6 py-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-700">
                Phase Journey
              </p>

              <h2 className="mt-1 text-base font-black text-[#16231C]">
                {isEstablished ? '90-Day Optimization Track' : '60-Day Execution Track'}
              </h2>
            </div>

            <span className="text-[11px] font-semibold text-[#89958F]">
              {isEstablished ? 'Follow the journey from stabilization to expansion' : 'Follow the journey from registration to launch'}
            </span>
          </div>

          <div className="overflow-x-auto p-5 sm:p-6">
            <div className="flex min-w-[760px] items-center">
              {activePhasesList.map((phase, index) => {
                const phaseNumber = phase.id;
                const completedPhase = phaseNumber < activePhaseNumber;
                const activePhase = phaseNumber === activePhaseNumber;

                return (
                  <React.Fragment key={phase.id}>
                    <div
                      className={`relative flex min-w-[205px] items-center gap-3 rounded-2xl border px-4 py-3.5 transition-all ${
                        activePhase
                          ? 'border-blue-500 bg-gradient-to-br from-blue-50/50 to-white shadow-[0_8px_25px_rgba(37,99,235,0.08)]'
                          : completedPhase
                          ? 'border-blue-200/70 bg-blue-50/30'
                          : 'border-[#E2E8E4] bg-[#FAFCFB]'
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-xs font-black ${
                          completedPhase || activePhase
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-[#D7E0DB] bg-white text-[#7D8B84]'
                        }`}
                      >
                        {completedPhase ? (
                          <CheckIcon size={17} />
                        ) : activePhase ? (
                          <SparkIcon size={17} />
                        ) : (
                          phaseNumber
                        )}
                      </div>

                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.12em] text-[#789087]">
                          Phase {phase.id} · {phase.short}
                        </p>

                        <p
                          className={`mt-1 text-xs font-black ${
                            activePhase
                              ? 'text-blue-700'
                              : completedPhase
                              ? 'text-blue-700'
                              : 'text-[#63726B]'
                          }`}
                        >
                          {phase.name}
                        </p>
                      </div>
                    </div>

                    {index < activePhasesList.length - 1 && (
                      <div className="mx-2 flex flex-1 items-center">
                        <div
                          className={`h-[2px] w-full ${
                            phaseNumber < activePhaseNumber
                              ? 'bg-blue-600'
                              : 'bg-[#E2E9E5]'
                          }`}
                        />
                        <div
                          className={`-ml-1 h-2 w-2 rotate-45 border-r border-t ${
                            phaseNumber < activePhaseNumber
                              ? 'border-blue-600'
                              : 'border-[#D6DFDA]'
                          }`}
                        />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================
            MILESTONE CHECKLIST
        ========================================================= */}
        <section className="relative mb-7 overflow-hidden rounded-[28px] border border-[#DDE6E0] bg-white shadow-[0_12px_45px_rgba(24,62,43,0.055)]">

          <div className="flex flex-col justify-between gap-4 border-b border-[#E9EEEB] px-6 py-5 sm:flex-row sm:items-center sm:px-7">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-[-0.02em] text-[#14221A]">
                  Milestone Checklist
                </h2>

                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-black text-blue-700 border border-blue-200/60">
                  {completedCount}/{tasks.length}
                </span>
              </div>

              <p className="mt-1 text-xs text-[#77867E]">
                {isEstablished ? 'Execute each milestone to stabilize cash flow, optimize margins, and expand operations.' : 'Complete each step to move your business toward launch.'}
              </p>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPhaseMenu((value) => !value)}
                className="inline-flex items-center gap-2 rounded-xl border border-[#DCE5E0] bg-white px-4 py-2.5 text-[11px] font-extrabold text-[#33443B] shadow-sm transition-all hover:border-[#B9D4C4]"
              >
                {phaseFilter === 'All'
                  ? 'View All Phases'
                  : phaseFilter}
                <ChevronDown size={14} />
              </button>

              {showPhaseMenu && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-30 w-56 overflow-hidden rounded-2xl border border-[#DDE6E0] bg-white p-1.5 shadow-[0_18px_45px_rgba(20,45,32,0.14)]">
                  <button
                    type="button"
                    onClick={() => {
                      setPhaseFilter('All');
                      setShowPhaseMenu(false);
                    }}
                    className={`w-full rounded-xl px-3 py-2.5 text-left text-xs font-bold ${
                      phaseFilter === 'All'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-[#52645A] hover:bg-[#F6F8F7]'
                    }`}
                  >
                    All Phases
                  </button>

                  {activePhasesList.map((phase) => (
                    <button
                      key={phase.id}
                      type="button"
                      onClick={() => {
                        setPhaseFilter(`Phase ${phase.id}`);
                        setShowPhaseMenu(false);
                      }}
                      className={`w-full rounded-xl px-3 py-2.5 text-left text-xs font-bold ${
                        phaseFilter === `Phase ${phase.id}`
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-[#52645A] hover:bg-[#F6F8F7]'
                      }`}
                    >
                      Phase {phase.id} · {phase.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="relative px-5 py-6 sm:px-7 sm:py-7">

            {/* timeline line */}
            <div className="absolute bottom-10 left-[40px] top-10 hidden w-px bg-gradient-to-b from-blue-400 via-blue-200 to-slate-200 sm:block" />

            <div className="space-y-3">
              {filteredTasks.map((task) => {
                const status = getTaskStatus(task);
                const styles = getStatusClasses(task);
                const expanded = expandedId === task.id;

                return (
                  <article
                    id={`milestone-${task.id}`}
                    key={task.id}
                    className={`relative rounded-[21px] border transition-all duration-200 ${styles.card}`}
                  >
                    <div
                      className="cursor-pointer p-4 sm:p-5"
                      onClick={() => toggleExpanded(task.id)}
                    >
                      <div className="flex items-center gap-3 sm:gap-4">

                        {/* Timeline node */}
                        <div className="relative z-10 hidden shrink-0 sm:block">
                          <div
                            className={`flex h-11 w-11 items-center justify-center rounded-full border-2 text-xs font-black transition-all ${styles.node}`}
                          >
                            {task.done ? (
                              <CheckIcon size={18} />
                            ) : (
                              task.id
                            )}
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="mb-1.5 flex flex-wrap items-center gap-2">
                            <span className="text-[9px] font-black uppercase tracking-[0.13em] text-[#7D9085]">
                              {task.phase} · {task.phaseName}
                            </span>

                            <span
                              className={`rounded-full border px-2.5 py-1 text-[9px] font-black ${styles.badge}`}
                            >
                              {status}
                            </span>
                          </div>

                          <h3
                            className={`text-sm font-black leading-5 tracking-[-0.01em] sm:text-[15px] ${
                              task.done
                                ? 'text-[#718079] line-through decoration-[#81928A] decoration-1'
                                : 'text-[#17241D]'
                            }`}
                          >
                            {task.title}
                          </h3>
                        </div>

                        <div className="hidden shrink-0 text-right sm:block">
                          <p className="text-sm font-black text-[#16231C]">
                            {task.deadline}
                          </p>
                          <p className="mt-0.5 text-[9px] font-semibold text-[#89958F]">
                            Target
                          </p>
                        </div>

                        <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#DCE5E0] bg-white text-[#6B7C73] sm:flex">
                          {expanded ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between sm:hidden">
                        <span className="text-[11px] font-bold text-[#63736B]">
                          {task.deadline}
                        </span>

                        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#DCE5E0] bg-white text-[#6B7C73]">
                          {expanded ? (
                            <ChevronUp size={15} />
                          ) : (
                            <ChevronDown size={15} />
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Expanded detail panel */}
                    {expanded && (
                      <div className="border-t border-[#E6ECE8] bg-gradient-to-b from-[#FBFDFC] to-white px-4 pb-5 pt-5 sm:px-5">

                        <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr_1.05fr_0.85fr]">

                          {/* What to do */}
                          <div className="lg:border-r lg:border-[#E7ECE9] lg:pr-5">
                            <div className="mb-3 flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                <CheckIcon size={15} />
                              </div>

                              <h4 className="text-xs font-black text-[#15231B]">
                                What to do
                              </h4>
                            </div>

                            <div className="space-y-2.5">
                              {task.steps.map((step, index) => (
                                <div
                                  key={`${task.id}-step-${index}`}
                                  className="flex items-start gap-2.5"
                                >
                                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                                    <CheckIcon size={12} />
                                  </span>

                                  <p className="text-[11px] leading-5 text-[#586A61]">
                                    {step}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Why it matters */}
                          <div className="lg:border-r lg:border-[#E7ECE9] lg:pr-5">
                            <div className="mb-3 flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFF6E7] text-[#D1810E]">
                                <LightbulbIcon size={15} />
                              </div>

                              <h4 className="text-xs font-black text-[#15231B]">
                                Why it matters
                              </h4>
                            </div>

                            <p className="text-[11px] leading-6 text-[#586A61]">
                              {task.why}
                            </p>

                            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
                              <p className="text-[9px] font-black uppercase tracking-[0.12em] text-[#8A9891]">
                                Milestone objective
                              </p>

                              <p className="mt-1 text-[11px] font-bold text-[#304139]">
                                Move the project one step closer to launch.
                              </p>
                            </div>
                          </div>

                          {/* Documents */}
                          <div className="lg:border-r lg:border-[#E7ECE9] lg:pr-5">
                            <div className="mb-3 flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F2F1FF] text-[#6A61C9]">
                                <DocumentIcon size={15} />
                              </div>

                              <h4 className="text-xs font-black text-[#15231B]">
                                Documents needed
                              </h4>
                            </div>

                            <div className="space-y-2">
                              {task.documents.map((document) => (
                                <div
                                  key={document}
                                  className="group flex items-center gap-2.5 rounded-xl border border-[#E4EAE7] bg-white px-3 py-2.5 transition-colors hover:border-[#C7DDD0] hover:bg-[#FAFDFB]"
                                >
                                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F5F7FF] text-[#6E76B6]">
                                    <DocumentIcon size={13} />
                                  </span>

                                  <span className="text-[10px] font-semibold leading-4 text-[#506159]">
                                    {document}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Related scheme */}
                          <div>
                            <div className="mb-3 flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-[#0B7B47]">
                                <SparkIcon size={15} />
                              </div>

                              <h4 className="text-xs font-black text-[#15231B]">
                                Related Scheme
                              </h4>
                            </div>

                            <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/40 to-white p-4">
                              <div className="absolute -right-5 -top-5 h-16 w-16 rounded-full bg-blue-100/50 blur-xl" />

                              <div className="relative">
                                <p className="text-base font-black text-[#17251D]">
                                  {task.scheme}
                                </p>

                                <span className="mt-2 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-black text-blue-700">
                                  {task.fit}
                                </span>

                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                  }}
                                  className="mt-4 flex items-center gap-1.5 text-[10px] font-black text-blue-700 transition-colors hover:text-blue-800"
                                >
                                  View scheme details
                                  <ArrowRight size={13} />
                                </button>
                              </div>
                            </div>

                            <div className="mt-3 flex items-center gap-2 text-[9px] font-semibold text-[#7C8983]">
                              <ShieldIcon size={13} />
                              Matched to your business profile
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 flex flex-col gap-2.5 border-t border-[#E6ECE8] pt-5 sm:flex-row">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                            }}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-black text-white shadow-[0_7px_18px_rgba(37,99,235,0.20)] transition-all hover:-translate-y-0.5 hover:bg-blue-700"
                          >
                            View Full Details
                            <ArrowRight size={15} />
                          </button>

                          {!task.done && (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                toggleTask(task.id);
                              }}
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-5 py-3 text-xs font-black text-blue-700 transition-all hover:-translate-y-0.5 hover:bg-blue-50"
                            >
                              <CheckIcon size={15} />
                              Mark as Complete
                            </button>
                          )}

                          {task.done && (
                            <div className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-3 text-xs font-bold text-blue-700">
                              <CheckIcon size={15} />
                              Milestone completed
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>

            {filteredTasks.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#CFDAD4] bg-[#FAFCFB] p-10 text-center">
                <p className="text-sm font-bold text-[#617169]">
                  No milestones found for this phase.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* =========================================================
            PREMIUM EXECUTION COMMAND CENTER
        ========================================================= */}
        <section className="relative mb-6">
          <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-600 shadow-[0_0_0_5px_rgba(37,99,235,0.12)]" />
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-700">
                  Execution Command Center
                </p>
              </div>
              <h2 className="mt-1 text-xl font-black tracking-[-0.03em] text-[#14221A]">
                Your business is moving forward.
              </h2>
              <p className="mt-1 text-xs text-[#78867F]">
                A quick view of your execution health, readiness and next target.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-[#D6E7DC] bg-white px-3 py-2 text-[10px] font-bold text-[#63736A] shadow-sm sm:self-auto">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              Live roadmap status
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[1fr_1.15fr_1fr]">
            {/* ROADMAP HEALTH */}
            <div className="group relative overflow-hidden rounded-[26px] border border-[#DCE7E1] bg-white shadow-[0_12px_40px_rgba(24,62,43,0.055)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(24,62,43,0.10)]">
              <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-blue-100/50 opacity-70 blur-3xl" />
              <div className="relative p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-700">
                      <HeartIcon size={19} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-blue-700">Roadmap Health</p>
                      <h3 className="mt-0.5 text-sm font-black text-[#17241D]">Overall Progress</h3>
                    </div>
                  </div>
                  <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[9px] font-black text-blue-700">Healthy</span>
                </div>

                <div className="mt-6 flex justify-center">
                  <div className="relative h-[172px] w-[172px]">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 180 180">
                      <circle cx="90" cy="90" r="68" stroke="#E2E8F0" strokeWidth="11" fill="none" />
                      <circle
                        cx="90"
                        cy="90"
                        r="68"
                        stroke="#2563EB"
                        strokeWidth="11"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 68}
                        strokeDashoffset={2 * Math.PI * 68 - (progressPct / 100) * (2 * Math.PI * 68)}
                        className="transition-all duration-700"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[38px] font-black leading-none tracking-[-0.06em] text-blue-700">{progressPct}%</span>
                      <span className="mt-2 text-[8px] font-black uppercase tracking-[0.18em] text-[#7B8982]">Complete</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-center">
                  <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-[10px] font-black text-blue-700">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white"><CheckIcon size={10} /></span>
                    On Track
                  </div>
                </div>
                <p className="mt-3 text-center text-[10px] leading-5 text-[#7A8981]">
                  Your execution is progressing according to the planned roadmap.
                </p>
              </div>
            </div>

            {/* EXECUTION PULSE */}
            <div className="group relative overflow-hidden rounded-[26px] border border-[#DCE7E1] bg-white shadow-[0_12px_40px_rgba(24,62,43,0.055)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(24,62,43,0.10)]">
              <div className="pointer-events-none absolute bottom-0 right-0 h-44 w-44 rounded-full bg-[#EEF6FF] opacity-70 blur-3xl" />
              <div className="relative p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#DCE7FA] bg-[#F0F5FF] text-[#4778C8]">
                      <ChartIcon size={19} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-blue-700">Execution Pulse</p>
                      <h3 className="mt-0.5 text-sm font-black text-[#17241D]">Roadmap Snapshot</h3>
                    </div>
                  </div>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F2F7FF] text-[#4778C8]"><SparkIcon size={15} /></span>
                </div>

                <div className="mt-5 rounded-2xl border border-[#D7E7DD] bg-gradient-to-r from-[#F1FAF4] to-white p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.12em] text-[#819089]">Current Phase</p>
                      <p className="mt-1 text-sm font-black text-[#17251D]">Phase {activePhaseNumber}</p>
                      <p className="mt-0.5 text-[10px] font-semibold text-blue-700">{currentTask?.phaseName}</p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-blue-200 bg-white text-blue-700 shadow-sm"><TargetIcon size={19} /></div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-[#E5EBE7] bg-[#FCFDFC] p-3.5">
                    <p className="text-[9px] font-bold text-[#849189]">Milestones</p>
                    <p className="mt-1 text-xl font-black text-[#16241B]">{completedCount}<span className="text-xs font-bold text-[#A0AAA5]">/{tasks.length}</span></p>
                    <p className="mt-0.5 text-[9px] text-[#8A9690]">completed</p>
                  </div>
                  <div className="rounded-2xl border border-[#E5EBE7] bg-[#FCFDFC] p-3.5">
                    <p className="text-[9px] font-bold text-[#849189]">Avg. Pace</p>
                    <p className="mt-1 text-xl font-black text-blue-700">7.5</p>
                    <p className="mt-0.5 text-[9px] text-[#8A9690]">days / milestone</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-2xl border border-[#E8EDE9] bg-white px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFF5E5] text-[#C77A0B]"><CalendarIcon size={15} /></div>
                    <div>
                      <p className="text-[9px] font-bold text-[#89958F]">Next Target</p>
                      <p className="text-[11px] font-black text-[#25362D]">{currentTask?.deadline}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-blue-700">On Schedule</span>
                </div>
              </div>
            </div>

            {/* BUSINESS READINESS */}
            <div className="group relative overflow-hidden rounded-[26px] border border-[#DCE7E1] bg-white shadow-[0_12px_40px_rgba(24,62,43,0.055)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(24,62,43,0.10)]">
              <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[#E8F4FF] opacity-70 blur-3xl" />
              <div className="relative p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#DDE7F8] bg-[#F1F6FF] text-[#4D78C6]"><ShieldIcon size={19} /></div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-blue-700">Business Readiness</p>
                      <h3 className="mt-0.5 text-sm font-black text-[#17241D]">Launch Preparedness</h3>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-[#4778C8]">{progressPct} / 100</span>
                </div>

                <div className="mt-5 rounded-[20px] border border-[#DDE7F4] bg-gradient-to-br from-[#F5F9FF] via-white to-[#FAFCFF] p-5">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-4xl font-black tracking-[-0.05em] text-[#263E59]">{progressPct}</p>
                      <p className="mt-1 text-[9px] font-black uppercase tracking-[0.14em] text-[#82909D]">Readiness Score</p>
                    </div>
                    <div className="rounded-xl bg-white px-3 py-2 text-right shadow-sm">
                      <p className="text-[9px] font-bold text-[#84919B]">Status</p>
                      <p className="mt-0.5 text-[10px] font-black text-blue-700">{progressPct >= 75 ? 'Ready for Review' : progressPct >= 50 ? 'Good Progress' : 'Initial Setup'}</p>
                    </div>
                  </div>
                  <div className="mt-5">
                    <div className="mb-2 flex justify-between text-[9px] font-bold text-[#839099]"><span>Current readiness</span><span>{progressPct}%</span></div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#E9EFF3]"><div className="h-full rounded-full bg-gradient-to-r from-[#4D78C6] to-[#79A3E4] transition-all duration-700" style={{ width: `${progressPct}%` }} /></div>
                  </div>
                </div>

                <div className="mt-4 space-y-2.5">
                  <div className="flex items-center gap-3"><div className="h-1.5 w-1.5 rounded-full bg-blue-600" /><span className="flex-1 text-[10px] font-semibold text-slate-600">Legal readiness</span><span className="text-[10px] font-black text-blue-700">Ready</span></div>
                  <div className="flex items-center gap-3"><div className="h-1.5 w-1.5 rounded-full bg-blue-600" /><span className="flex-1 text-[10px] font-semibold text-slate-600">Documentation</span><span className="text-[10px] font-black text-blue-700">Ready</span></div>
                  <div className="flex items-center gap-3"><div className="h-1.5 w-1.5 rounded-full bg-[#E3A229]" /><span className="flex-1 text-[10px] font-semibold text-[#63726B]">Funding readiness</span><span className="text-[10px] font-black text-[#B87508]">In Progress</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* PREMIUM RESOURCE STRIP */}
          <div className="mt-5 overflow-hidden rounded-[24px] border border-[#DCE6E0] bg-white shadow-[0_10px_32px_rgba(24,62,43,0.045)]">
            <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center">
              <div className="flex shrink-0 items-center gap-3 lg:w-[210px]">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF5E5] text-[#C77A0B]"><FolderIcon size={19} /></div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.15em] text-blue-700">Resources</p>
                  <p className="text-sm font-black text-[#17241D]">Useful References</p>
                </div>
              </div>

              <div className="grid flex-1 gap-2.5 md:grid-cols-3">
                {[
                  { title: 'PMEGP Official Portal', description: 'Government scheme landing page', tone: 'blue' },
                  { title: 'KVIC PMEGP Guidelines', description: 'Eligibility & application rules', tone: 'amber' },
                  { title: 'Sample DPR Format', description: 'Bankable project report template', tone: 'blue' },
                ].map((resource) => (
                  <button
                    type="button"
                    key={resource.title}
                    className="group/resource flex items-center gap-3 rounded-2xl border border-[#E3E9E5] bg-[#FCFDFC] p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#BDD8C8] hover:bg-white hover:shadow-[0_8px_24px_rgba(24,62,43,0.07)]"
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${resource.tone === 'blue' ? 'bg-blue-50 text-blue-700' : resource.tone === 'amber' ? 'bg-[#FFF4E2] text-[#C77A0B]' : 'bg-[#EEF4FF] text-[#4C78C9]'}`}>
                      <DocumentIcon size={15} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[10px] font-black text-[#273830]">{resource.title}</span>
                      <span className="mt-0.5 block truncate text-[9px] text-[#89958F]">{resource.description}</span>
                    </span>
                    <span className={`transition-transform duration-200 group-hover/resource:translate-x-1 ${resource.tone === 'blue' ? 'text-blue-700' : resource.tone === 'amber' ? 'text-[#C77A0B]' : 'text-[#4C78C9]'}`}>
                      <ExternalIcon size={14} />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            INFORMATION FOOTER
        ========================================================= */}
        <div className="flex items-start gap-3 rounded-2xl border border-[#D7E6F7] bg-gradient-to-r from-[#F3F8FE] to-[#F8FBFF] px-4 py-3.5 text-[10px] leading-5 text-[#63778B] shadow-[0_4px_15px_rgba(46,92,137,0.03)]">
          <span className="mt-0.5 shrink-0 text-[#4B82C5]"><InfoIcon size={15} /></span>
          <p>
            Milestone timelines are indicative. Actual duration may vary based on government processing,
            lender approvals, documentation readiness and project-specific requirements.
          </p>
        </div>
      </div>
    </div>
  );
}
