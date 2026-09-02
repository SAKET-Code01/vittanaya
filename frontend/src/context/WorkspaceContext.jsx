import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  buildAdaptiveWorkspace,
  calculateFinancialSummary,
  BUSINESS_TYPES,
  AVAILABLE_OPERATIONS,
} from '../data/adaptiveWorkspaceConfig';

import { DEFAULT_OPERATIONS_CONFIG } from '../data/defaultOperationsConfig';
import { DEFAULT_CASH_ACCOUNTS, DEFAULT_TRANSACTIONS } from '../data/cashOverviewMockData.js';
import { apiClient } from '../services/apiClient';

const WorkspaceContext = createContext(null);

const STORAGE_KEYS = {
  PROFILE: 'vittanaya_profile_v2',
  FINANCIAL: 'vittanaya_financial_v2',
  ACTIVE_NAV: 'vittanaya_active_nav',
  OPERATIONS: 'vittanaya_operations_config_v2',
  CASH_ACCOUNTS: 'vittanaya_cash_accounts_v2',
  CASH_TRANSACTIONS: 'vittanaya_cash_transactions_v2',
  PREFERENCES: 'vittanaya_preferences_v2',
};

const DEFAULT_PREFERENCES = {
  compactMode: false,
  autoRefresh: true,
  theme: 'light',
  language: 'English',
  dateFormat: 'DD/MM/YYYY',
  numberFormat: 'Indian (Lakhs / Crores)',
  timeZone: 'Asia/Kolkata (IST +5:30)',
  currency: 'INR (₹)',
  soundNotifications: true,
  notifications: {
    transactionAlerts: true,
    cashFlowAlerts: true,
    paymentReminders: true,
    invoiceAlerts: true,
    lowCashAlerts: true,
    weeklyReports: true,
    systemUpdates: false,
    emailInApp: true,
  },
  privacy: {
    privacySettings: true,
    dataSharing: false,
    connectedServices: true,
    dataRetention: '3 Years',
  },
};

const DEFAULT_FINANCIAL_DATA = {
  cash_balance: 1485000,
  receivables_total: 2850000,
  payables_total: 1920000,
  expected_inflow: 930000,
  expected_outflow: 720000,
  min_cash_buffer: 500000,
};

// Normalize business database entity into bidirectional frontend profile
export function normalizeBusinessProfile(data, prev = {}) {
  if (!data) return prev;
  const village = data.location_village || data.village || null;
  const block = data.location_block || data.block || null;
  const district = data.location_district || data.district || data.location || null;
  const state = data.location_state || data.state || null;
  const pin = data.location_pin || data.pin || null;
  const locationCombined = [district, state].filter(Boolean).join(', ') || district || state || 'Odisha';

  const regNo = data.udyam_registration || data.regNo || null;
  const legalStructure = data.legal_structure || data.legalStructure || null;
  const financialYear = data.financial_year || data.financialYear || null;
  const taxRegime = data.tax_regime || data.taxRegime || null;
  const businessSince = data.business_since || data.businessSince || null;
  const registeredAddress = data.registered_address || data.registeredAddress || null;
  const ownerName = data.owner_name || data.ownerName || data.user_name || null;

  return {
    ...prev,
    id: data.id,
    // Core identity
    name: data.name,
    businessName: data.name,
    business_name: data.name,
    owner_name: ownerName,
    ownerName: ownerName,
    user_name: ownerName,
    // Business classification
    category: data.category || data.type,
    type: data.type || data.category,
    businessType: data.type || data.category,
    industry: data.industry,
    stage: data.stage,
    // Location
    location_village: village,
    village: village,
    location_block: block,
    block: block,
    location_district: district,
    district: district,
    location: locationCombined,
    location_state: state,
    state: state,
    location_pin: pin,
    pin: pin,
    // Financial baseline
    own_capital: Number(data.own_capital || 0),
    ownCapital: Number(data.own_capital || 0),
    project_cost: Number(data.project_cost || 0),
    projectCost: Number(data.project_cost || 0),
    estimatedProjectCost: Number(data.project_cost || 0),
    monthly_revenue: Number(data.monthly_revenue_estimate ?? data.monthly_revenue ?? 0),
    monthlyRevenue: Number(data.monthly_revenue_estimate ?? data.monthly_revenue ?? 0),
    monthly_revenue_estimate: Number(data.monthly_revenue_estimate ?? data.monthly_revenue ?? 0),
    monthly_expenses: Number(data.monthly_expense_estimate ?? data.monthly_expenses ?? 0),
    monthlyExpenses: Number(data.monthly_expense_estimate ?? data.monthly_expenses ?? 0),
    monthly_expense_estimate: Number(data.monthly_expense_estimate ?? data.monthly_expenses ?? 0),
    // Demographics
    social_category: data.social_category || null,
    socialCategory: data.social_category || null,
    area_type: data.area_type || null,
    areaType: data.area_type || null,
    // Contact
    phone: data.phone || null,
    email: data.email || null,
    // Description
    description: data.description || null,
    // Business Identity & Compliance
    gstin: data.gstin || null,
    pan: data.pan || null,
    udyam_registration: regNo,
    regNo: regNo,
    legal_structure: legalStructure,
    legalStructure: legalStructure,
    financial_year: financialYear,
    financialYear: financialYear,
    tax_regime: taxRegime,
    taxRegime: taxRegime,
    business_since: businessSince,
    businessSince: businessSince,
    registered_address: registeredAddress,
    registeredAddress: registeredAddress,
    notes: data.notes || null,
    currency: data.currency || 'INR (₹)',
    onboardingCompletedAt: prev?.onboardingCompletedAt || new Date().toISOString(),
  };
}

export function WorkspaceProvider({ children }) {
  // 0. Demo Mode State (Isolated experience with zero persistence to real data)
  const [isDemoMode, setIsDemoMode] = useState(false);

  // 1. Dynamic Profile State (Initialized from LocalStorage if available)
  // NOTE: Returns null for brand-new users who haven't completed onboarding.
  // buildAdaptiveWorkspace({}) is ONLY called after the user completes onboarding,
  // NOT as a default fallback, to prevent demo/sample data pre-filling the form.
  const [currentProfile, setCurrentProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only restore a profile that was produced by a REAL onboarding completion.
        // onboardingCompletedAt is set exclusively by WorkspaceContext.setCurrentProfile
        // at the end of a real onboarding flow — never by buildAdaptiveWorkspace defaults.
        if (parsed && parsed.onboardingCompletedAt) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read saved profile from localStorage', e);
    }
    // Fresh session: no pre-filled demo data
    return null;
  });

  // 2. Dynamic Financial Starting Position (Editable)
  const [financialData, setFinancialData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FINANCIAL);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read saved financial data from localStorage', e);
    }
    return DEFAULT_FINANCIAL_DATA;
  });

  // 3. Dynamic Operations Configurations (13 Operations Config Store)
  const [operationsConfig, setOperationsConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.OPERATIONS);
      if (saved) {
        return { ...DEFAULT_OPERATIONS_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Could not read saved operations config from localStorage', e);
    }
    return DEFAULT_OPERATIONS_CONFIG;
  });

  // 4. Dynamic Cash Accounts (Persisted)
  const [cashAccounts, setCashAccounts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CASH_ACCOUNTS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read saved cash accounts from localStorage', e);
    }
    return DEFAULT_CASH_ACCOUNTS;
  });

  // 5. Dynamic Cash Transactions (Persisted)
  const [cashTransactions, setCashTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CASH_TRANSACTIONS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read saved cash transactions from localStorage', e);
    }
    return DEFAULT_TRANSACTIONS;
  });

  // 6. Application Preferences (Persisted)
  const [appPreferences, setAppPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      // The shared navbar toggle writes the authoritative theme key.
      let themeFromNav = null;
      try {
        const navTheme = localStorage.getItem('vittanaya-theme');
        if (navTheme === 'dark' || navTheme === 'light') themeFromNav = navTheme;
      } catch (e) { }
      const mergedTheme = themeFromNav || (saved ? JSON.parse(saved).theme : null) || 'light';
      const base = saved ? { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) } : DEFAULT_PREFERENCES;
      return { ...base, theme: mergedTheme };
    } catch (e) {
      try {
        const navTheme = localStorage.getItem('vittanaya-theme');
        if (navTheme === 'dark' || navTheme === 'light') {
          return { ...DEFAULT_PREFERENCES, theme: navTheme };
        }
      } catch (e2) { }
      return DEFAULT_PREFERENCES;
    }
  });

  // 7. Navigation State & History
  const [activeNavId, setActiveNavIdState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_NAV);
      if (saved) return saved;
    } catch (e) { }
    return 'dashboard';
  });

  const [navHistory, setNavHistory] = useState(['dashboard']);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Navigate to a new workspace section (pushes to history stack and clears forward history)
  const navigateTo = React.useCallback((navId) => {
    if (!navId) return;
    setActiveNavIdState(navId);
    setNavHistory((prev) => {
      if (prev[historyIndex] === navId) return prev;
      const truncated = prev.slice(0, historyIndex + 1);
      const next = [...truncated, navId];
      setHistoryIndex(next.length - 1);
      return next;
    });
  }, [historyIndex]);

  // Back navigation
  const canGoBack = historyIndex > 0;
  const goBack = React.useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const targetNav = navHistory[prevIndex];
      setHistoryIndex(prevIndex);
      setActiveNavIdState(targetNav);
    }
  }, [historyIndex, navHistory]);

  // Forward navigation
  const canGoForward = historyIndex < navHistory.length - 1;
  const goForward = React.useCallback(() => {
    if (historyIndex < navHistory.length - 1) {
      const nextIndex = historyIndex + 1;
      const targetNav = navHistory[nextIndex];
      setHistoryIndex(nextIndex);
      setActiveNavIdState(targetNav);
    }
  }, [historyIndex, navHistory]);

  // Home navigation
  const goHome = React.useCallback(() => {
    navigateTo('dashboard');
  }, [navigateTo]);

  // Clear navigation history (on logout / new session)
  const clearNavigationHistory = React.useCallback(() => {
    setNavHistory(['dashboard']);
    setHistoryIndex(0);
    setActiveNavIdState('dashboard');
  }, []);

  const setActiveNavId = navigateTo;

  // Save changes to localStorage for persistent state across navigation & reloads ONLY when not in demo mode
  useEffect(() => {
    if (isDemoMode) return;
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(currentProfile));
    } catch (e) { }
  }, [currentProfile, isDemoMode]);

  useEffect(() => {
    if (isDemoMode) return;
    try {
      localStorage.setItem(STORAGE_KEYS.FINANCIAL, JSON.stringify(financialData));
    } catch (e) { }
  }, [financialData, isDemoMode]);

  useEffect(() => {
    if (isDemoMode) return;
    try {
      localStorage.setItem(STORAGE_KEYS.OPERATIONS, JSON.stringify(operationsConfig));
    } catch (e) { }
  }, [operationsConfig, isDemoMode]);

  useEffect(() => {
    if (isDemoMode) return;
    try {
      localStorage.setItem(STORAGE_KEYS.CASH_ACCOUNTS, JSON.stringify(cashAccounts));
    } catch (e) { }
  }, [cashAccounts, isDemoMode]);

  useEffect(() => {
    if (isDemoMode) return;
    try {
      localStorage.setItem(STORAGE_KEYS.CASH_TRANSACTIONS, JSON.stringify(cashTransactions));
    } catch (e) { }
  }, [cashTransactions, isDemoMode]);

  useEffect(() => {
    if (isDemoMode) return;
    try {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(appPreferences));
    } catch (e) { }
  }, [appPreferences, isDemoMode]);

  useEffect(() => {
    if (isDemoMode) return;
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_NAV, activeNavId);
    } catch (e) { }
  }, [activeNavId, isDemoMode]);

  // Global Theme Engine (Light / Dark / System)
  useEffect(() => {
    const theme = appPreferences.theme || 'light';
    const root = document.documentElement;

    const applyTheme = (isDark) => {
      if (isDark) {
        root.classList.add('dark');
        root.classList.remove('light');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
        root.style.colorScheme = 'light';
      }
    };

    if (theme === 'dark') {
      applyTheme(true);
    } else if (theme === 'light') {
      applyTheme(false);
    } else if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches);

      const handler = (e) => applyTheme(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [appPreferences.theme]);

  // Global Compact Mode Engine
  useEffect(() => {
    const isCompact = Boolean(appPreferences.compactMode);
    const root = document.documentElement;
    if (isCompact) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }
  }, [appPreferences.compactMode]);

  // Global Auto Refresh Engine (Pulse data refresh every 30 seconds)
  const [lastRefreshedTime, setLastRefreshedTime] = useState(Date.now());

  useEffect(() => {
    if (appPreferences.autoRefresh === false) return;

    const interval = setInterval(() => {
      setLastRefreshedTime(Date.now());
      window.dispatchEvent(new CustomEvent('vittanaya-auto-refresh', { detail: { timestamp: Date.now() } }));
    }, 30000);

    return () => clearInterval(interval);
  }, [appPreferences.autoRefresh]);

  // Derived Financial Summary (Runway, Gap, Net Flow, Lowest Cash, Score)
  const financialSummary = useMemo(() => {
    return calculateFinancialSummary(financialData);
  }, [financialData]);

  // Helper to format now date-time
  const getFormattedNow = () => {
    const d = new Date();
    return (
      d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ', ' +
      d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    );
  };

  // Stored list of user businesses
  const [businessList, setBusinessList] = useState([]);

  // Fetch active business profile from SQLite backend DB on mount
  // Uses /list to get all businesses, then uses the stored active ID or picks the first.
  useEffect(() => {
    apiClient.get('/business/list')
      .then((businesses) => {
        if (!Array.isArray(businesses) || businesses.length === 0) return;
        setBusinessList(businesses);

        // Determine which business to load: prefer the stored active ID
        let storedId = null;
        try { storedId = parseInt(localStorage.getItem('vittanaya_active_business_id'), 10); } catch (e) {}
        const data = (storedId && businesses.find((b) => b.id === storedId)) || businesses[0];

        // Persist the active business ID (just the ID, not profile data)
        try { localStorage.setItem('vittanaya_active_business_id', String(data.id)); } catch (e) {}

        setCurrentProfile((prev) => normalizeBusinessProfile(data, prev));
      })
      .catch((err) => console.warn('Could not fetch active business profile from backend DB', err));
  }, []);

  // Action: Switch active business workspace
  const switchBusiness = useCallback(async (businessId) => {
    try {
      const data = await apiClient.get(`/business?business_id=${businessId}`);
      if (data) {
        try { localStorage.setItem('vittanaya_active_business_id', String(data.id)); } catch (e) {}
        setCurrentProfile((prev) => normalizeBusinessProfile(data, prev));
        return data;
      }
    } catch (err) {
      console.error(`Failed to switch to business ${businessId}:`, err);
    }
  }, []);

  // Action: Update user or business identity fields (Server-Authoritative Save)
  const updateProfile = async (fields = {}) => {
    const currentId = currentProfile?.id;
    if (!currentId) {
      console.warn('No active business selected for updateProfile');
      return currentProfile;
    }

    // Build the PUT payload — every DB-backed field must be explicitly included
    const payload = {
      // Core identity
      name: fields.name ?? fields.business_name ?? fields.businessName ?? currentProfile.name,
      owner_name: fields.owner_name ?? fields.user_name ?? fields.ownerName ?? currentProfile.owner_name ?? null,
      // Business classification
      type: fields.type ?? fields.businessType ?? currentProfile.type,
      industry: fields.industry ?? currentProfile.industry,
      category: fields.category ?? currentProfile.category,
      stage: fields.stage ?? currentProfile.stage,
      // Location
      location_village: fields.location_village ?? fields.village ?? currentProfile.location_village ?? null,
      location_block: fields.location_block ?? fields.block ?? currentProfile.location_block ?? null,
      location_district: fields.location_district ?? fields.district ?? fields.location ?? currentProfile.location_district ?? null,
      location_state: fields.location_state ?? fields.state ?? currentProfile.location_state ?? null,
      location_pin: fields.location_pin ?? fields.pin ?? currentProfile.location_pin ?? null,
      // Financial baseline
      own_capital: typeof fields.own_capital === 'number' ? fields.own_capital
        : (fields.ownCapital != null ? parseFloat(fields.ownCapital) : (fields.own_capital != null ? parseFloat(fields.own_capital) : (currentProfile.own_capital ?? 0))),
      project_cost: typeof fields.project_cost === 'number' ? fields.project_cost
        : (fields.projectCost != null ? parseFloat(fields.projectCost) : (fields.project_cost != null ? parseFloat(fields.project_cost) : (currentProfile.project_cost ?? 0))),
      monthly_revenue_estimate: typeof fields.monthly_revenue === 'number' ? fields.monthly_revenue
        : (fields.monthlyRevenue != null ? parseFloat(fields.monthlyRevenue) : (fields.monthly_revenue_estimate != null ? parseFloat(fields.monthly_revenue_estimate) : (currentProfile.monthly_revenue ?? 0))),
      monthly_expense_estimate: typeof fields.monthly_expenses === 'number' ? fields.monthly_expenses
        : (fields.monthlyExpenses != null ? parseFloat(fields.monthlyExpenses) : (fields.monthly_expense_estimate != null ? parseFloat(fields.monthly_expense_estimate) : (currentProfile.monthly_expenses ?? 0))),
      // Demographics
      social_category: fields.social_category ?? fields.socialCategory ?? currentProfile.social_category ?? null,
      area_type: fields.area_type ?? fields.areaType ?? currentProfile.area_type ?? null,
      // Contact
      phone: fields.phone ?? currentProfile.phone ?? null,
      email: fields.email ?? currentProfile.email ?? null,
      // Description
      description: fields.description ?? currentProfile.description ?? null,
      // Business Identity & Compliance
      gstin: fields.gstin ?? currentProfile.gstin ?? null,
      pan: fields.pan ?? currentProfile.pan ?? null,
      udyam_registration: fields.udyam_registration ?? fields.regNo ?? currentProfile.udyam_registration ?? null,
      legal_structure: fields.legal_structure ?? fields.legalStructure ?? currentProfile.legal_structure ?? null,
      financial_year: fields.financial_year ?? fields.financialYear ?? currentProfile.financial_year ?? null,
      tax_regime: fields.tax_regime ?? fields.taxRegime ?? currentProfile.tax_regime ?? null,
      business_since: fields.business_since ?? fields.businessSince ?? currentProfile.business_since ?? null,
      registered_address: fields.registered_address ?? fields.registeredAddress ?? currentProfile.registered_address ?? null,
      notes: fields.notes ?? currentProfile.notes ?? null,
    };

    try {
      const saved = await apiClient.put(`/business/${currentId}`, payload);

      // Persist active business ID
      try { localStorage.setItem('vittanaya_active_business_id', String(saved.id)); } catch (e) {}

      const normalizedProfile = normalizeBusinessProfile(saved, {
        ...currentProfile,
        lastUpdatedAt: getFormattedNow(),
      });

      setCurrentProfile(normalizedProfile);
      setBusinessList((prevList) => prevList.map((b) => (b.id === saved.id ? saved : b)));
      return normalizedProfile;
    } catch (err) {
      console.error('Failed to sync business profile to backend DB', err);
      throw err;
    }
  };

  // Action: Update Business Type
  const updateBusinessType = (newTypeId) => {
    const typeConfig = BUSINESS_TYPES.find((b) => b.id === newTypeId);
    if (!typeConfig) return;

    setCurrentProfile((prev) => {
      const updated = {
        ...prev,
        businessType: newTypeId,
        category: typeConfig.label,
        industry: typeConfig.desc,
        terminology: typeConfig.terminology,
        description: prev.description || typeConfig.desc,
        lastUpdatedAt: getFormattedNow(),
      };
      return updated;
    });
  };

  // Action: Update selected operations (synchronizes sidebar & active modules)
  const updateOperations = (newSelectedOps = []) => {
    setCurrentProfile((prev) => {
      // Recompile operational KPIs
      const businessKpis = [];
      newSelectedOps.forEach((opId) => {
        const op = AVAILABLE_OPERATIONS.find((o) => o.id === opId);
        if (op && op.defaultKpis) {
          businessKpis.push(...op.defaultKpis);
        }
      });

      return {
        ...prev,
        selectedOperations: newSelectedOps,
        businessKpis: businessKpis.slice(0, 4),
        lastUpdatedAt: getFormattedNow(),
      };
    });
  };

  // Action: Toggle a single operation on/off
  const toggleOperation = (opId) => {
    setCurrentProfile((prev) => {
      const currentOps = prev.selectedOperations || [];
      const exists = currentOps.includes(opId);
      const newOps = exists ? currentOps.filter((id) => id !== opId) : [...currentOps, opId];

      const businessKpis = [];
      newOps.forEach((id) => {
        const op = AVAILABLE_OPERATIONS.find((o) => o.id === id);
        if (op && op.defaultKpis) {
          businessKpis.push(...op.defaultKpis);
        }
      });

      return {
        ...prev,
        selectedOperations: newOps,
        businessKpis: businessKpis.slice(0, 4),
        lastUpdatedAt: getFormattedNow(),
      };
    });
  };

  // Action: Update starting financial values (triggers instant recalculation of derived values)
  const updateFinancialValues = (newValues = {}) => {
    setFinancialData((prev) => ({
      ...prev,
      ...newValues,
    }));
  };

  // Action: Reset financial values to default mock values
  const resetFinancialValues = () => {
    setFinancialData(DEFAULT_FINANCIAL_DATA);
  };

  // Action: Complete Onboarding and set source of truth
  const completeOnboarding = ({
    businessName,
    ownerName,
    phone,
    email,
    businessType,
    selectedOps,
    location,
    gstin,
  }) => {
    const formattedNow = getFormattedNow();
    const newWorkspace = buildAdaptiveWorkspace({
      businessName: businessName || 'My MSME Business',
      ownerName: ownerName || 'Business Owner',
      phone: phone || '+91 98765 43210',
      email: email || 'contact@business.com',
      businessType: businessType || 'manufacturing',
      selectedOps: selectedOps && selectedOps.length > 0 ? selectedOps : ['sales', 'purchases'],
      location: location || 'India',
      gstin: gstin || '',
      onboardingCompletedAt: formattedNow,
      lastUpdatedAt: formattedNow,
    });

    setCurrentProfile(newWorkspace);
  };

  // Action: Update configuration for a specific operation
  const updateOperationConfig = (opId, newValues = {}) => {
    setOperationsConfig((prev) => ({
      ...prev,
      [opId]: {
        ...(prev[opId] || DEFAULT_OPERATIONS_CONFIG[opId] || {}),
        ...newValues,
      },
    }));
  };

  // Action: Enable an operation (add to active list)
  const enableOperation = (opId) => {
    setCurrentProfile((prev) => {
      const currentOps = prev.selectedOperations || [];
      if (currentOps.includes(opId)) return prev;
      const newOps = [...currentOps, opId];

      const businessKpis = [];
      newOps.forEach((id) => {
        const op = AVAILABLE_OPERATIONS.find((o) => o.id === id);
        if (op && op.defaultKpis) {
          businessKpis.push(...op.defaultKpis);
        }
      });

      return {
        ...prev,
        selectedOperations: newOps,
        businessKpis: businessKpis.slice(0, 4),
        lastUpdatedAt: getFormattedNow(),
      };
    });
  };

  // Action: Deactivate an operation (remove from active list, preserve config)
  const deactivateOperation = (opId) => {
    setCurrentProfile((prev) => {
      const currentOps = prev.selectedOperations || [];
      const newOps = currentOps.filter((id) => id !== opId);

      const businessKpis = [];
      newOps.forEach((id) => {
        const op = AVAILABLE_OPERATIONS.find((o) => o.id === id);
        if (op && op.defaultKpis) {
          businessKpis.push(...op.defaultKpis);
        }
      });

      return {
        ...prev,
        selectedOperations: newOps,
        businessKpis: businessKpis.slice(0, 4),
        lastUpdatedAt: getFormattedNow(),
      };
    });
  };

  // Action: Add a new cash transaction entry (updates financialData.cash_balance, account balance, and transactions list)
  const addCashEntry = ({
    type = 'inflow',
    amount = 0,
    date = '',
    category = 'Sales',
    description = '',
    account = 'HDFC Bank - 4502',
    notes = '',
  }) => {
    const numAmount = Math.abs(Number(amount) || 0);
    const signedAmount = type === 'inflow' ? numAmount : -numAmount;
    const nowStr = getFormattedNow();
    const displayDate = date || nowStr;

    // 1. Update overall Cash Balance
    setFinancialData((prev) => {
      const updatedBalance = Math.max(0, (prev.cash_balance || 0) + signedAmount);
      return {
        ...prev,
        cash_balance: updatedBalance,
        ...(type === 'inflow'
          ? { expected_inflow: Math.max(0, (prev.expected_inflow || 0) + numAmount) }
          : { expected_outflow: Math.max(0, (prev.expected_outflow || 0) + numAmount) }),
      };
    });

    // 2. Update matching Account balance
    setCashAccounts((prev) =>
      prev.map((acc) => {
        if (acc.name === account || acc.id === account) {
          const newBal = Math.max(0, (acc.balance || 0) + signedAmount);
          return {
            ...acc,
            balance: newBal,
            inflow: type === 'inflow' ? (acc.inflow || 0) + numAmount : acc.inflow,
            outflow: type === 'outflow' ? (acc.outflow || 0) + numAmount : acc.outflow,
            lastUpdated: 'Updated just now',
          };
        }
        return acc;
      })
    );

    // 3. Prepend to Cash Transactions
    const categoryColors = {
      Sales: 'emerald',
      Fuel: 'amber',
      Purchases: 'blue',
      Interest: 'purple',
      Travel: 'amber',
      Payroll: 'rose',
      Utilities: 'blue',
      Rent: 'purple',
      Other: 'slate',
    };

    const newTx = {
      id: `tx-${Date.now()}`,
      date: displayDate,
      rawDate: new Date().toISOString().split('T')[0],
      description: description || (type === 'inflow' ? 'Cash Received' : 'Cash Paid'),
      category: category || 'General',
      categoryColor: categoryColors[category] || 'slate',
      type: type,
      typeLabel: type === 'inflow' ? 'Inflow' : 'Outflow',
      amount: signedAmount,
      balanceAfter: (financialData.cash_balance || 0) + signedAmount,
      account: account,
      notes: notes,
    };

    setCashTransactions((prev) => [newTx, ...prev]);
  };

  // Action: Add a new cash account
  const addCashAccount = ({
    name = '',
    accountNumber = '',
    type = 'Savings Account',
    bankName = '',
    balance = 0,
    iconColor = 'blue',
  }) => {
    const numBalance = Number(balance) || 0;
    const newAcc = {
      id: `acc-${Date.now()}`,
      name: name || `${bankName || 'Bank'} Account`,
      accountNumber: accountNumber ? `•••• ${accountNumber.slice(-4)}` : '•••• 0000',
      type: type,
      bankName: bankName || name,
      balance: numBalance,
      inflow: numBalance > 0 ? numBalance : 0,
      outflow: 0,
      lastUpdated: 'Updated just now',
      iconColor: iconColor || 'blue',
    };

    setCashAccounts((prev) => [...prev, newAcc]);

    // Add to total cash balance if initial balance > 0
    if (numBalance > 0) {
      setFinancialData((prev) => ({
        ...prev,
        cash_balance: (prev.cash_balance || 0) + numBalance,
      }));
    }
  };

  // Action: Update application preferences & settings
  const updatePreferences = (partialPreferences = {}) => {
    setAppPreferences((prev) => ({
      ...prev,
      ...partialPreferences,
      notifications: {
        ...(prev.notifications || {}),
        ...(partialPreferences.notifications || {}),
      },
      privacy: {
        ...(prev.privacy || {}),
        ...(partialPreferences.privacy || {}),
      },
    }));
  };

  // Action: Enter Demo Mode (Isolated mock demonstration)
  const enterDemoMode = () => {
    setIsDemoMode(true);
    setCurrentProfile(
      buildAdaptiveWorkspace({
        businessName: 'Apex Precision Engineering (Demo)',
        ownerName: 'Demo User',
        businessType: 'manufacturing',
        selectedOps: ['sales', 'purchases', 'inventory', 'payroll', 'tax_gst', 'manufacturing'],
        location: 'Pune, Maharashtra',
        gstin: '27AABCU9603R1ZM',
      })
    );
    setFinancialData({
      cash_balance: 1485000,
      receivables_total: 2850000,
      payables_total: 1920000,
      expected_inflow: 930000,
      expected_outflow: 720000,
      min_cash_buffer: 500000,
    });
  };

  // Action: Exit Demo Mode (Restores clean persistent state from localStorage without saving demo data)
  const exitDemoMode = () => {
    setIsDemoMode(false);
    try {
      const savedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        // Only restore a real onboarded profile, not demo/placeholder data
        setCurrentProfile((parsed && parsed.onboardingCompletedAt) ? parsed : null);
      } else {
        setCurrentProfile(null);
      }
    } catch (e) {
      setCurrentProfile(null);
    }
    try {
      const savedFin = localStorage.getItem(STORAGE_KEYS.FINANCIAL);
      setFinancialData(savedFin ? JSON.parse(savedFin) : DEFAULT_FINANCIAL_DATA);
    } catch (e) {
      setFinancialData(DEFAULT_FINANCIAL_DATA);
    }
  };

  const value = {
    isDemoMode,
    enterDemoMode,
    exitDemoMode,
    currentProfile,
    setCurrentProfile,
    financialData,
    financialSummary,
    operationsConfig,
    cashAccounts,
    setCashAccounts,
    cashTransactions,
    setCashTransactions,
    addCashEntry,
    addCashAccount,
    appPreferences,
    setAppPreferences,
    updatePreferences,
    lastRefreshedTime,
    activeNavId,
    setActiveNavId,
    navigateTo,
    canGoBack,
    canGoForward,
    goBack,
    goForward,
    goHome,
    clearNavigationHistory,
    navHistory,
    historyIndex,
    updateProfile,
    updateBusinessType,
    updateOperations,
    toggleOperation,
    updateOperationConfig,
    enableOperation,
    deactivateOperation,
    updateFinancialValues,
    resetFinancialValues,
    completeOnboarding,
    businessList,
    switchBusiness,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
