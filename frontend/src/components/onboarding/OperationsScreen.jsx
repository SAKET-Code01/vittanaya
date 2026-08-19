import React, { useState } from 'react';

/**
 * OperationsScreen Component (Step 4 of Onboarding)
 * 100% visually identical reproduction of the approved Step 4 reference design
 * with enhanced human-friendly MSME wording and business-aware content.
 * 
 * Features:
 * - Top-left VITTANAYA logo with "Financial Intelligence"
 * - Top 4-stage progress tracker:
 *    - Step 1: Welcome (Completed ✓, Green)
 *    - Step 2: Business Information (Completed ✓, Green)
 *    - Step 3: Business Type (Completed ✓, Green)
 *    - Step 4: Complete Setup (Active 4, Blue)
 * - Two-column main container:
 *    - Left Panel:
 *       - Heading: "What does your business / need to manage?"
 *       - Subtext: "Select everything that applies. We'll use your choices to build / the right workspace for your business."
 *       - Label: "What would you like to manage? *"
 *       - 5x2 Grid of 10 Operation Cards adapted contextually to selected business type
 *       - Multi-selection support with top-right blue checkmark on selected cards
 *       - Subtle info bar: "You can add or modify what you manage anytime from Settings."
 *       - Back and Complete Setup buttons
 *    - Right Panel:
 *       - Workspace customization illustration with clipboard checklist, floating 3D chart, 3D gear, 3D shield, 3D pie disc, and potted plant
 *       - Heading: "We'll customize your workspace / around what you manage"
 *       - 4 Value propositions with circular icons
 * - Bottom security guarantee with lock icon
 */

// Contextual Operation Generator for Step 4
export function getOperationsForBusinessType(businessType) {
  // Common shared icons
  const salesIcon = (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 8h4" />
    </svg>
  );

  const purchasesIcon = (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );

  const stockIcon = (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  );

  const productionIcon = (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M4 19h16v2H4v-2zm16-4V7l-4 3V7l-4 3V4l-6 5v10h14zM8 17H6v-6.5l2-1.67V17zm4 0h-2V11.5l2-1.5V17zm4 0h-2V11.5l2-1.5V17z" />
    </svg>
  );

  const employeesIcon = (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  );

  const assetsIcon = (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );

  const projectsIcon = (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" />
    </svg>
  );

  const bankingIcon = (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M4 10v7h3v-7H4zm6 0v7h3v-7h-3zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm9.5-21L2 6v2h19V6l-9.5-5z" />
    </svg>
  );

  const loansIcon = (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
      <path d="M6 15h4v2H6z" />
    </svg>
  );

  const otherIcon = (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <circle cx="5" cy="12" r="2.5" />
      <circle cx="12" cy="12" r="2.5" />
      <circle cx="19" cy="12" r="2.5" />
    </svg>
  );

  const fleetIcon = (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18 18.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5zm-12 0a2.5 2.5 0 110-5 2.5 2.5 0 010 5zM20 8h-3V4H3a1 1 0 00-1 1v11a1 1 0 001 1h1.08a4.5 4.5 0 018.84 0h3.16a4.5 4.5 0 018.84 0H23a1 1 0 001-1v-5l-4-3zm-1 3.5V9.5h2.15l2.4 2.5H19z" />
    </svg>
  );

  const fuelIcon = (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77zM12 10H6V5h6v5zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
    </svg>
  );

  const maintenanceIcon = (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z" />
    </svg>
  );

  // 1. Transport / Logistics Specific Terminology
  if (businessType === 'transport') {
    return [
      {
        id: 'sales',
        title: 'Sales & Customer Payments',
        description: 'Track client freight, invoices and payments',
        iconBg: 'bg-[#EEF2FF] text-[#3B82F6]',
        icon: salesIcon,
      },
      {
        id: 'purchases',
        title: 'Purchases & Supplier Payments',
        description: 'Track vendor bills and payments',
        iconBg: 'bg-[#ECFDF5] text-[#059669]',
        icon: purchasesIcon,
      },
      {
        id: 'fleet',
        title: 'Fleet & Vehicles',
        description: 'Manage vehicles, trips and fleet assets',
        iconBg: 'bg-[#F0F9FF] text-[#0284C7]',
        icon: fleetIcon,
      },
      {
        id: 'fuel',
        title: 'Fuel & Expenses',
        description: 'Track fuel costs, tolls and operating expenses',
        iconBg: 'bg-[#FFFBEB] text-[#D97706]',
        icon: fuelIcon,
      },
      {
        id: 'employees',
        title: 'Drivers & Employees',
        description: 'Manage drivers, employees and salaries',
        iconBg: 'bg-[#F0FDF4] text-[#16A34A]',
        icon: employeesIcon,
      },
      {
        id: 'maintenance',
        title: 'Maintenance & Repairs',
        description: 'Track vehicle servicing, repairs and maintenance',
        iconBg: 'bg-[#FFF7ED] text-[#EA580C]',
        icon: maintenanceIcon,
      },
      {
        id: 'projects',
        title: 'Projects & Contracts',
        description: 'Track transport contracts, routes and progress',
        iconBg: 'bg-[#F5F3FF] text-[#7C3AED]',
        icon: projectsIcon,
      },
      {
        id: 'banking',
        title: 'Banking & Accounts',
        description: 'Track bank accounts, transactions and balances',
        iconBg: 'bg-[#FFF1F2] text-[#E11D48]',
        icon: bankingIcon,
      },
      {
        id: 'loans',
        title: 'Loans & Credit',
        description: 'Manage vehicle loans, EMIs and credit',
        iconBg: 'bg-[#FEFCE8] text-[#CA8A04]',
        icon: loansIcon,
      },
      {
        id: 'other',
        title: 'Other',
        description: 'Something else your business handles',
        iconBg: 'bg-[#F1F5F9] text-[#64748B]',
        icon: otherIcon,
      },
    ];
  }

  // 2. Retail Specific Terminology
  if (businessType === 'retail') {
    return [
      {
        id: 'sales',
        title: 'Sales & Customer Payments',
        description: 'Track daily sales, invoices and customer dues',
        iconBg: 'bg-[#EEF2FF] text-[#3B82F6]',
        icon: salesIcon,
      },
      {
        id: 'purchases',
        title: 'Purchases & Supplier Payments',
        description: 'Track purchase orders, vendor bills and dues',
        iconBg: 'bg-[#ECFDF5] text-[#059669]',
        icon: purchasesIcon,
      },
      {
        id: 'inventory',
        title: 'Stock & Inventory',
        description: 'Manage store stock levels and items',
        iconBg: 'bg-[#FFFBEB] text-[#D97706]',
        icon: stockIcon,
      },
      {
        id: 'production',
        title: 'Production & Manufacturing',
        description: 'Manage store packaging, batches & costs',
        iconBg: 'bg-[#F5F3FF] text-[#7C3AED]',
        icon: productionIcon,
      },
      {
        id: 'employees',
        title: 'Employees & Salaries',
        description: 'Manage store staff, salaries and attendance',
        iconBg: 'bg-[#F0FDF4] text-[#16A34A]',
        icon: employeesIcon,
      },
      {
        id: 'assets',
        title: 'Equipment & Assets',
        description: 'Track store fixtures, POS machines and assets',
        iconBg: 'bg-[#FFF7ED] text-[#EA580C]',
        icon: assetsIcon,
      },
      {
        id: 'projects',
        title: 'Projects & Contracts',
        description: 'Track seasonal campaigns and vendor deals',
        iconBg: 'bg-[#F0F9FF] text-[#0284C7]',
        icon: projectsIcon,
      },
      {
        id: 'banking',
        title: 'Banking & Accounts',
        description: 'Track bank accounts, transactions and balances',
        iconBg: 'bg-[#FFF1F2] text-[#E11D48]',
        icon: bankingIcon,
      },
      {
        id: 'loans',
        title: 'Loans & Credit',
        description: 'Manage business loans, EMIs and credit',
        iconBg: 'bg-[#FEFCE8] text-[#CA8A04]',
        icon: loansIcon,
      },
      {
        id: 'other',
        title: 'Other',
        description: 'Something else your business handles',
        iconBg: 'bg-[#F1F5F9] text-[#64748B]',
        icon: otherIcon,
      },
    ];
  }

  // 3. Services Specific Terminology
  if (businessType === 'services') {
    return [
      {
        id: 'sales',
        title: 'Sales & Customer Payments',
        description: 'Track client billings, invoices and collections',
        iconBg: 'bg-[#EEF2FF] text-[#3B82F6]',
        icon: salesIcon,
      },
      {
        id: 'purchases',
        title: 'Purchases & Supplier Payments',
        description: 'Track vendor expenses, bills and dues',
        iconBg: 'bg-[#ECFDF5] text-[#059669]',
        icon: purchasesIcon,
      },
      {
        id: 'projects',
        title: 'Projects & Contracts',
        description: 'Track client projects, milestones and progress',
        iconBg: 'bg-[#F0F9FF] text-[#0284C7]',
        icon: projectsIcon,
      },
      {
        id: 'inventory',
        title: 'Stock & Inventory',
        description: 'Manage office assets, supplies and equipment',
        iconBg: 'bg-[#FFFBEB] text-[#D97706]',
        icon: stockIcon,
      },
      {
        id: 'employees',
        title: 'Employees & Salaries',
        description: 'Manage team, contractor payouts and salaries',
        iconBg: 'bg-[#F0FDF4] text-[#16A34A]',
        icon: employeesIcon,
      },
      {
        id: 'assets',
        title: 'Equipment & Assets',
        description: 'Track computers, software & office assets',
        iconBg: 'bg-[#FFF7ED] text-[#EA580C]',
        icon: assetsIcon,
      },
      {
        id: 'production',
        title: 'Production & Manufacturing',
        description: 'Manage deliverables, client briefs and costs',
        iconBg: 'bg-[#F5F3FF] text-[#7C3AED]',
        icon: productionIcon,
      },
      {
        id: 'banking',
        title: 'Banking & Accounts',
        description: 'Track bank accounts, transactions and balances',
        iconBg: 'bg-[#FFF1F2] text-[#E11D48]',
        icon: bankingIcon,
      },
      {
        id: 'loans',
        title: 'Loans & Credit',
        description: 'Manage business credit, credit cards & loans',
        iconBg: 'bg-[#FEFCE8] text-[#CA8A04]',
        icon: loansIcon,
      },
      {
        id: 'other',
        title: 'Other',
        description: 'Something else your business handles',
        iconBg: 'bg-[#F1F5F9] text-[#64748B]',
        icon: otherIcon,
      },
    ];
  }

  // 4. Construction Specific Terminology
  if (businessType === 'construction') {
    return [
      {
        id: 'sales',
        title: 'Sales & Customer Payments',
        description: 'Track client billings, running bills and dues',
        iconBg: 'bg-[#EEF2FF] text-[#3B82F6]',
        icon: salesIcon,
      },
      {
        id: 'purchases',
        title: 'Purchases & Supplier Payments',
        description: 'Track material suppliers, vendor bills and dues',
        iconBg: 'bg-[#ECFDF5] text-[#059669]',
        icon: purchasesIcon,
      },
      {
        id: 'projects',
        title: 'Projects & Contracts',
        description: 'Track site projects, subcontracts and progress',
        iconBg: 'bg-[#F0F9FF] text-[#0284C7]',
        icon: projectsIcon,
      },
      {
        id: 'inventory',
        title: 'Stock & Inventory',
        description: 'Manage cement, steel and site materials',
        iconBg: 'bg-[#FFFBEB] text-[#D97706]',
        icon: stockIcon,
      },
      {
        id: 'employees',
        title: 'Employees & Salaries',
        description: 'Manage site workers, contractor bills & wages',
        iconBg: 'bg-[#F0FDF4] text-[#16A34A]',
        icon: employeesIcon,
      },
      {
        id: 'assets',
        title: 'Equipment & Assets',
        description: 'Track heavy machinery, tools and site assets',
        iconBg: 'bg-[#FFF7ED] text-[#EA580C]',
        icon: assetsIcon,
      },
      {
        id: 'production',
        title: 'Production & Manufacturing',
        description: 'Manage site fabrication, batch work and costs',
        iconBg: 'bg-[#F5F3FF] text-[#7C3AED]',
        icon: productionIcon,
      },
      {
        id: 'banking',
        title: 'Banking & Accounts',
        description: 'Track project bank accounts and transactions',
        iconBg: 'bg-[#FFF1F2] text-[#E11D48]',
        icon: bankingIcon,
      },
      {
        id: 'loans',
        title: 'Loans & Credit',
        description: 'Manage project finance, machinery loans & credit',
        iconBg: 'bg-[#FEFCE8] text-[#CA8A04]',
        icon: loansIcon,
      },
      {
        id: 'other',
        title: 'Other',
        description: 'Something else your business handles',
        iconBg: 'bg-[#F1F5F9] text-[#64748B]',
        icon: otherIcon,
      },
    ];
  }

  // 5. Healthcare Specific Terminology
  if (businessType === 'healthcare') {
    return [
      {
        id: 'sales',
        title: 'Sales & Customer Payments',
        description: 'Track patient receipts, OP/IP billing and dues',
        iconBg: 'bg-[#EEF2FF] text-[#3B82F6]',
        icon: salesIcon,
      },
      {
        id: 'purchases',
        title: 'Purchases & Supplier Payments',
        description: 'Track medical supplies, pharma bills & dues',
        iconBg: 'bg-[#ECFDF5] text-[#059669]',
        icon: purchasesIcon,
      },
      {
        id: 'inventory',
        title: 'Stock & Inventory',
        description: 'Manage medicines, consumables & pharmacy stock',
        iconBg: 'bg-[#FFFBEB] text-[#D97706]',
        icon: stockIcon,
      },
      {
        id: 'employees',
        title: 'Employees & Salaries',
        description: 'Manage doctors, nurses, staff salaries & duties',
        iconBg: 'bg-[#F0FDF4] text-[#16A34A]',
        icon: employeesIcon,
      },
      {
        id: 'assets',
        title: 'Equipment & Assets',
        description: 'Track diagnostic machines, clinic beds & assets',
        iconBg: 'bg-[#FFF7ED] text-[#EA580C]',
        icon: assetsIcon,
      },
      {
        id: 'projects',
        title: 'Projects & Contracts',
        description: 'Track institutional tie-ups, camps and contracts',
        iconBg: 'bg-[#F0F9FF] text-[#0284C7]',
        icon: projectsIcon,
      },
      {
        id: 'production',
        title: 'Production & Manufacturing',
        description: 'Manage lab formulas, diagnostics and costs',
        iconBg: 'bg-[#F5F3FF] text-[#7C3AED]',
        icon: productionIcon,
      },
      {
        id: 'banking',
        title: 'Banking & Accounts',
        description: 'Track clinic bank accounts and transactions',
        iconBg: 'bg-[#FFF1F2] text-[#E11D48]',
        icon: bankingIcon,
      },
      {
        id: 'loans',
        title: 'Loans & Credit',
        description: 'Manage medical equipment loans, EMIs and credit',
        iconBg: 'bg-[#FEFCE8] text-[#CA8A04]',
        icon: loansIcon,
      },
      {
        id: 'other',
        title: 'Other',
        description: 'Something else your business handles',
        iconBg: 'bg-[#F1F5F9] text-[#64748B]',
        icon: otherIcon,
      },
    ];
  }

  // 6. Education Specific Terminology
  if (businessType === 'education') {
    return [
      {
        id: 'sales',
        title: 'Sales & Customer Payments',
        description: 'Track student fees, fee receipts and pending dues',
        iconBg: 'bg-[#EEF2FF] text-[#3B82F6]',
        icon: salesIcon,
      },
      {
        id: 'purchases',
        title: 'Purchases & Supplier Payments',
        description: 'Track books, supplies, vendor bills & payments',
        iconBg: 'bg-[#ECFDF5] text-[#059669]',
        icon: purchasesIcon,
      },
      {
        id: 'employees',
        title: 'Employees & Salaries',
        description: 'Manage teachers, staff salaries & attendance',
        iconBg: 'bg-[#F0FDF4] text-[#16A34A]',
        icon: employeesIcon,
      },
      {
        id: 'assets',
        title: 'Equipment & Assets',
        description: 'Track campus buildings, buses & equipment',
        iconBg: 'bg-[#FFF7ED] text-[#EA580C]',
        icon: assetsIcon,
      },
      {
        id: 'inventory',
        title: 'Stock & Inventory',
        description: 'Manage uniforms, books & stationery stock',
        iconBg: 'bg-[#FFFBEB] text-[#D97706]',
        icon: stockIcon,
      },
      {
        id: 'projects',
        title: 'Projects & Contracts',
        description: 'Track academic terms, events and projects',
        iconBg: 'bg-[#F0F9FF] text-[#0284C7]',
        icon: projectsIcon,
      },
      {
        id: 'production',
        title: 'Production & Manufacturing',
        description: 'Manage learning materials, print & costs',
        iconBg: 'bg-[#F5F3FF] text-[#7C3AED]',
        icon: productionIcon,
      },
      {
        id: 'banking',
        title: 'Banking & Accounts',
        description: 'Track institutional bank accounts and deposits',
        iconBg: 'bg-[#FFF1F2] text-[#E11D48]',
        icon: bankingIcon,
      },
      {
        id: 'loans',
        title: 'Loans & Credit',
        description: 'Manage institutional loans, EMIs and credit',
        iconBg: 'bg-[#FEFCE8] text-[#CA8A04]',
        icon: loansIcon,
      },
      {
        id: 'other',
        title: 'Other',
        description: 'Something else your business handles',
        iconBg: 'bg-[#F1F5F9] text-[#64748B]',
        icon: otherIcon,
      },
    ];
  }

  // 7. Trading / Wholesale Specific Terminology
  if (businessType === 'trading') {
    return [
      {
        id: 'sales',
        title: 'Sales & Customer Payments',
        description: 'Track wholesale orders, invoices & customer dues',
        iconBg: 'bg-[#EEF2FF] text-[#3B82F6]',
        icon: salesIcon,
      },
      {
        id: 'purchases',
        title: 'Purchases & Supplier Payments',
        description: 'Track bulk purchases, supplier bills & dues',
        iconBg: 'bg-[#ECFDF5] text-[#059669]',
        icon: purchasesIcon,
      },
      {
        id: 'inventory',
        title: 'Stock & Inventory',
        description: 'Manage warehouse stock, batches and items',
        iconBg: 'bg-[#FFFBEB] text-[#D97706]',
        icon: stockIcon,
      },
      {
        id: 'production',
        title: 'Production & Manufacturing',
        description: 'Manage packaging, assembly & costs',
        iconBg: 'bg-[#F5F3FF] text-[#7C3AED]',
        icon: productionIcon,
      },
      {
        id: 'employees',
        title: 'Employees & Salaries',
        description: 'Manage warehouse staff, sales reps & salaries',
        iconBg: 'bg-[#F0FDF4] text-[#16A34A]',
        icon: employeesIcon,
      },
      {
        id: 'assets',
        title: 'Equipment & Assets',
        description: 'Track godowns, delivery vans & equipment',
        iconBg: 'bg-[#FFF7ED] text-[#EA580C]',
        icon: assetsIcon,
      },
      {
        id: 'projects',
        title: 'Projects & Contracts',
        description: 'Track supply contracts, bulk deals & progress',
        iconBg: 'bg-[#F0F9FF] text-[#0284C7]',
        icon: projectsIcon,
      },
      {
        id: 'banking',
        title: 'Banking & Accounts',
        description: 'Track bank accounts, transactions and balances',
        iconBg: 'bg-[#FFF1F2] text-[#E11D48]',
        icon: bankingIcon,
      },
      {
        id: 'loans',
        title: 'Loans & Credit',
        description: 'Manage CC/OD limits, working capital & EMIs',
        iconBg: 'bg-[#FEFCE8] text-[#CA8A04]',
        icon: loansIcon,
      },
      {
        id: 'other',
        title: 'Other',
        description: 'Something else your business handles',
        iconBg: 'bg-[#F1F5F9] text-[#64748B]',
        icon: otherIcon,
      },
    ];
  }

  // 8. Standard / Manufacturing / Default MSME Operations
  return [
    {
      id: 'sales',
      title: 'Sales & Customer Payments',
      description: 'Track sales, invoices and money customers owe you',
      iconBg: 'bg-[#EEF2FF] text-[#3B82F6]',
      icon: salesIcon,
    },
    {
      id: 'purchases',
      title: 'Purchases & Supplier Payments',
      description: 'Track purchases, bills and money you need to pay',
      iconBg: 'bg-[#ECFDF5] text-[#059669]',
      icon: purchasesIcon,
    },
    {
      id: 'inventory',
      title: 'Stock & Inventory',
      description: 'Manage products, stock levels and warehouses',
      iconBg: 'bg-[#FFFBEB] text-[#D97706]',
      icon: stockIcon,
    },
    {
      id: 'production',
      title: 'Production & Manufacturing',
      description: 'Manage what you make, production and costs',
      iconBg: 'bg-[#F5F3FF] text-[#7C3AED]',
      icon: productionIcon,
    },
    {
      id: 'employees',
      title: 'Employees & Salaries',
      description: 'Manage employees, salaries and attendance',
      iconBg: 'bg-[#F0FDF4] text-[#16A34A]',
      icon: employeesIcon,
    },
    {
      id: 'assets',
      title: 'Equipment & Assets',
      description: 'Track machines, vehicles and other business assets',
      iconBg: 'bg-[#FFF7ED] text-[#EA580C]',
      icon: assetsIcon,
    },
    {
      id: 'projects',
      title: 'Projects & Contracts',
      description: 'Track projects, contracts and their progress',
      iconBg: 'bg-[#F0F9FF] text-[#0284C7]',
      icon: projectsIcon,
    },
    {
      id: 'banking',
      title: 'Banking & Accounts',
      description: 'Track bank accounts, transactions and balances',
      iconBg: 'bg-[#FFF1F2] text-[#E11D48]',
      icon: bankingIcon,
    },
    {
      id: 'loans',
      title: 'Loans & Credit',
      description: 'Manage loans, EMIs and credit',
      iconBg: 'bg-[#FEFCE8] text-[#CA8A04]',
      icon: loansIcon,
    },
    {
      id: 'other',
      title: 'Other',
      description: 'Something else your business handles',
      iconBg: 'bg-[#F1F5F9] text-[#64748B]',
      icon: otherIcon,
    },
  ];
}

export default function OperationsScreen({
  businessType = '',
  selectedOps = [],
  onToggleOp,
  onBack,
  onComplete,
}) {
  const [error, setError] = useState(null);

  const operationCards = getOperationsForBusinessType(businessType);

  const handleCardClick = (opId) => {
    onToggleOp(opId);
    if (error) setError(null);
  };

  const handleCompleteClick = (e) => {
    e.preventDefault();
    if (!selectedOps || selectedOps.length === 0) {
      setError('Please select at least one operation.');
      return;
    }
    onComplete();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 relative overflow-x-hidden flex flex-col justify-between py-6 px-4 sm:px-8 select-none">
      
      {/* Top Header: VITTANAYA Brand + 4-Step Progress Tracker */}
      <header className="max-w-7xl w-full mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00C6FF] via-[#0072FF] to-[#7A00FF] flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-black text-xl tracking-tight">
            V
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tight text-[#0F172A] leading-none">
              VITTANAYA
            </h1>
            <p className="text-xs font-medium text-[#64748B] tracking-normal mt-0.5">
              Financial Intelligence
            </p>
          </div>
        </div>

        {/* 4-Step Progress Tracker */}
        <div className="flex items-center space-x-2 sm:space-x-4 self-center lg:self-auto overflow-x-auto py-1">
          {/* Step 1: Welcome (Completed) */}
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              ✓
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-[10px] font-semibold text-slate-400 block leading-tight">Step 1</span>
              <span className="text-xs font-semibold text-emerald-600 block leading-tight">Welcome</span>
            </div>
          </div>

          {/* Line 1: Green */}
          <div className="w-8 sm:w-14 h-[2px] bg-emerald-500 rounded-full" />

          {/* Step 2: Business Information (Completed) */}
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              ✓
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-[10px] font-semibold text-slate-400 block leading-tight">Step 2</span>
              <span className="text-xs font-semibold text-emerald-600 block leading-tight whitespace-nowrap">Business Information</span>
            </div>
          </div>

          {/* Line 2: Green */}
          <div className="w-8 sm:w-14 h-[2px] bg-emerald-500 rounded-full" />

          {/* Step 3: Business Type (Completed) */}
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              ✓
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-[10px] font-semibold text-slate-400 block leading-tight">Step 3</span>
              <span className="text-xs font-semibold text-emerald-600 block leading-tight whitespace-nowrap">Business Type</span>
            </div>
          </div>

          {/* Line 3: Blue */}
          <div className="w-8 sm:w-14 h-[2px] bg-blue-600 rounded-full" />

          {/* Step 4: Complete Setup (Active) */}
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-md shadow-blue-500/30">
              4
            </div>
            <div className="text-left">
              <span className="text-[10px] font-bold text-blue-600 block leading-tight">Step 4</span>
              <span className="text-xs font-bold text-[#0F172A] block leading-tight whitespace-nowrap">Complete Setup</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Two-Column Container */}
      <main className="max-w-6xl w-full mx-auto my-auto py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* ========================================================================= */}
          {/* LEFT PANEL: OPERATIONS SELECTION */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-[0_15px_40px_rgba(0,0,0,0.04)] flex flex-col justify-between space-y-4">
            
            {/* Heading Section */}
            <div className="space-y-1.5">
              <h2 className="text-3xl sm:text-[34px] font-black text-[#0F172A] leading-[1.15] tracking-tight">
                What does your business<br />need to manage?
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] font-normal leading-relaxed">
                Select everything that applies. We'll use your choices to build<br className="hidden sm:inline" />
                the right workspace for your business.
              </p>
            </div>

            {/* Selection Grid Area */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-slate-800">
                What would you like to manage? <span className="text-rose-500">*</span>
              </label>

              {/* 5x2 Grid of 10 Operation Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-2.5">
                {operationCards.map((card) => {
                  const isSelected = selectedOps.includes(card.id);

                  return (
                    <div
                      key={card.id}
                      onClick={() => handleCardClick(card.id)}
                      className={`relative p-2.5 sm:p-3 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-150 min-h-[135px] space-y-1 ${
                        isSelected
                          ? 'border-2 border-blue-600 bg-white ring-2 ring-blue-600/10 shadow-xs'
                          : 'border border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      {/* Top-Right Circular Checkmark Badge for Selected Card */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold shadow-xs">
                          ✓
                        </div>
                      )}

                      {/* Icon */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-0.5 ${card.iconBg}`}>
                        {card.icon}
                      </div>

                      {/* Title */}
                      <h4 className="text-[11px] sm:text-xs font-bold text-[#0F172A] leading-tight line-clamp-1">
                        {card.title}
                      </h4>

                      {/* Description */}
                      <p className="text-[9px] sm:text-[10px] text-[#64748B] leading-tight line-clamp-2">
                        {card.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Inline Validation Error Message */}
              {error && (
                <p className="text-[11px] font-medium text-rose-500 mt-1">
                  {error}
                </p>
              )}

              {/* Subtle Info Bar */}
              <div className="bg-blue-50/70 border border-blue-100/80 rounded-xl px-3.5 py-2.5 flex items-center space-x-2 text-xs text-slate-600">
                <div className="w-4 h-4 rounded-full border border-blue-400 text-blue-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                  i
                </div>
                <span className="text-[11px] text-slate-600 font-medium">
                  You can add or modify what you manage anytime from Settings.
                </span>
              </div>
            </div>

            {/* Bottom Navigation Actions: Back & Complete Setup */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <span>←</span>
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleCompleteClick}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#7000FF] via-[#5A3FFF] to-[#00A3FF] hover:from-[#6200EA] hover:to-[#0091EA] text-white font-bold text-sm tracking-wide shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <span>Complete Setup</span>
                <span>→</span>
              </button>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* RIGHT PANEL: WORKSPACE PERSONALIZATION ILLUSTRATION & VALUE PROP */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-[0_15px_40px_rgba(0,0,0,0.04)] flex flex-col justify-between space-y-6 relative overflow-hidden">
            
            {/* Top Visual: Workspace Checklist Document Composition */}
            <div className="relative w-full h-64 sm:h-72 bg-gradient-to-b from-[#F0F7FF] to-[#F8FAFC] rounded-2xl flex items-center justify-center p-4 border border-blue-50/80 overflow-hidden">
              
              {/* Soft background blue glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-blue-400/10 blur-2xl pointer-events-none" />

              {/* Central Clipboard / Operations Checklist Document */}
              <div className="relative w-52 sm:w-56 bg-white rounded-2xl p-4 shadow-xl border border-slate-100/90 space-y-2.5 z-10">
                {/* Clipboard Top Clip */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-4 rounded-t-md bg-blue-300 flex items-center justify-center shadow-xs">
                  <div className="w-4 h-1.5 rounded-full bg-white/80" />
                </div>

                {/* 5 Checklist Items with Category Icons and Emerald Checkmarks */}
                <div className="space-y-2 pt-1">
                  {/* Item 1: Invoices */}
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] flex-shrink-0">
                      📄
                    </div>
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] font-black flex-shrink-0">
                      ✓
                    </span>
                    <div className="h-1.5 w-28 bg-slate-200/90 rounded-full" />
                  </div>

                  {/* Item 2: Purchases */}
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center text-[10px] flex-shrink-0">
                      🛒
                    </div>
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] font-black flex-shrink-0">
                      ✓
                    </span>
                    <div className="h-1.5 w-32 bg-slate-200/90 rounded-full" />
                  </div>

                  {/* Item 3: Inventory */}
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center text-[10px] flex-shrink-0">
                      📦
                    </div>
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] font-black flex-shrink-0">
                      ✓
                    </span>
                    <div className="h-1.5 w-24 bg-slate-200/90 rounded-full" />
                  </div>

                  {/* Item 4: Production */}
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center text-[10px] flex-shrink-0">
                      🏭
                    </div>
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] font-black flex-shrink-0">
                      ✓
                    </span>
                    <div className="h-1.5 w-36 bg-slate-200/90 rounded-full" />
                  </div>

                  {/* Item 5: Employees */}
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 rounded-md bg-teal-50 text-teal-600 flex items-center justify-center text-[10px] flex-shrink-0">
                      👥
                    </div>
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] font-black flex-shrink-0">
                      ✓
                    </span>
                    <div className="h-1.5 w-26 bg-slate-200/90 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Floating 3D Chart Badge (Top-Right) */}
              <div className="absolute right-3 top-6 sm:top-8 w-11 h-11 rounded-2xl bg-white flex items-center justify-center shadow-lg border border-slate-100/90 z-20">
                <div className="h-6 flex items-end gap-1 px-1">
                  <div className="w-1.5 h-3 bg-cyan-400 rounded-t-sm" />
                  <div className="w-1.5 h-4.5 bg-blue-500 rounded-t-sm" />
                  <div className="w-1.5 h-6 bg-purple-600 rounded-t-sm" />
                </div>
              </div>

              {/* Floating 3D Settings Gear Badge (Middle-Right) */}
              <div className="absolute right-3 top-24 sm:top-28 w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-blue-500 shadow-md border border-slate-100 z-20">
                <svg className="w-5 h-5 animate-[spin_12s_linear_infinite]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>

              {/* Floating 3D Security Shield Badge with Lock (Left-Center) */}
              <div className="absolute left-3 bottom-8 sm:bottom-10 w-12 h-12 rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] flex items-center justify-center text-white shadow-xl shadow-blue-500/25 z-20 border-2 border-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>

              {/* Floating 3D Pie Disc (Top-Left) */}
              <div className="absolute left-3 top-16 sm:top-20 w-11 h-11 rounded-2xl bg-white flex items-center justify-center shadow-lg border border-slate-100 z-20">
                <svg className="w-6 h-6 text-cyan-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11 2v9h9A10 10 0 0011 2z" />
                  <path d="M9 4.05A10 10 0 1019.95 15H10a1 1 0 01-1-1V4.05z" fill="#06B6D4" opacity="0.8" />
                </svg>
              </div>

              {/* Potted Plant (Bottom-Right) */}
              <div className="absolute right-4 bottom-4 sm:bottom-6 z-20">
                <div className="relative flex flex-col items-center">
                  <svg className="w-9 h-9 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C7.58 2 4 5.58 4 10c0 2.5 1.15 4.74 2.95 6.22C7.03 16.5 7.1 16.76 7.17 17h9.66c.07-.24.14-.5.22-.78C18.85 14.74 20 12.5 20 10c0-4.42-3.58-8-8-8zm-1 14h2v-4h-2v4z" />
                  </svg>
                  <div className="w-5 h-4 bg-slate-100 border border-slate-300 rounded-b-md shadow-xs" />
                </div>
              </div>

            </div>

            {/* Bottom Value Propositions */}
            <div className="space-y-4 pt-1">
              <h3 className="text-base font-bold text-[#0F172A] leading-snug">
                We'll customize your workspace<br />
                around what you manage
              </h3>

              <div className="space-y-2.5 text-xs text-[#475569]">
                <div className="flex items-center space-x-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <circle cx="12" cy="12" r="9" strokeWidth="2.2" />
                      <circle cx="12" cy="12" r="5" strokeWidth="2.2" />
                      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                    </svg>
                  </div>
                  <span>Get insights that focus on what matters most</span>
                </div>

                <div className="flex items-center space-x-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <circle cx="12" cy="12" r="9" strokeWidth="2.2" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 7v5l3 2" />
                    </svg>
                  </div>
                  <span>Track the right metrics for your business</span>
                </div>

                <div className="flex items-center space-x-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span>Make smarter decisions with real-time data</span>
                </div>

                <div className="flex items-center space-x-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span>Everything in one secure platform</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Bottom Security Guarantee Footer */}
      <footer className="max-w-md mx-auto py-3 flex items-center justify-center space-x-3 text-center">
        <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div className="text-left">
          <p className="text-xs font-bold text-[#0F172A] leading-tight">
            Your information is secure with us.
          </p>
          <p className="text-[11px] text-[#64748B] leading-tight">
            We never share your data with anyone.
          </p>
        </div>
      </footer>

    </div>
  );
}
