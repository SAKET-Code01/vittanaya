/**
 * Reusable formatters for financial amounts, dates, percentages, and rural-friendly terminology.
 */

/**
 * Formats a numeric value into standard Indian Rupee notation (e.g. ₹14,85,000 or ₹14.85 Lakh).
 */
export const formatINR = (amount, compact = false) => {
  const num = Number(amount) || 0;
  if (compact) {
    if (Math.abs(num) >= 10000000) {
      return `₹${(num / 10000000).toFixed(2)} Cr`;
    }
    if (Math.abs(num) >= 100000) {
      return `₹${(num / 100000).toFixed(2)} L`;
    }
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

export const formatCurrency = formatINR;

/**
 * Standardizes user-facing dates into consistent format: "19 Aug 2026".
 */
export const formatDate = (dateString) => {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

/**
 * Formats a percentage value safely.
 */
export const formatPercentage = (val, decimals = 1) => {
  const num = Number(val);
  if (isNaN(num) || !isFinite(num)) return '0%';
  return `${num.toFixed(decimals)}%`;
};

/**
 * Safe numeric normalizer preventing NaN, null, undefined, or Infinity.
 */
export const safeNumber = (val, defaultVal = 0) => {
  const num = Number(val);
  if (val === null || val === undefined || isNaN(num) || !isFinite(num)) {
    return defaultVal;
  }
  return num;
};

/**
 * Safe string normalizer.
 */
export const safeString = (val, fallback = '—') => {
  if (val === null || val === undefined || String(val).trim() === '') {
    return fallback;
  }
  return String(val);
};

/**
 * Safe array normalizer.
 */
export const safeArray = (val) => {
  return Array.isArray(val) ? val : [];
};

/**
 * Safe object normalizer.
 */
export const safeObject = (val) => {
  return val && typeof val === 'object' && !Array.isArray(val) ? val : {};
};

/**
 * Plain-language dictionary for first-time rural and micro-business entrepreneurs.
 */
export const RURAL_FRIENDLY_DICTIONARY = {
  dscr: {
    plain: 'Loan repayment ability',
    technical: 'Debt Service Coverage Ratio (DSCR)',
    desc: 'Indicates how easily your business cash earnings cover monthly bank installments.',
  },
  liquidity_gap: {
    plain: 'Possible cash shortage',
    technical: 'Liquidity / Working Capital Gap',
    desc: 'The temporary cash shortfall when waiting for customer payments.',
  },
  moratorium: {
    plain: 'Initial repayment-free period',
    technical: 'Principal Moratorium',
    desc: 'A grace period where you do not need to repay the main loan amount while setting up.',
  },
  margin_money: {
    plain: 'Your upfront contribution',
    technical: 'Promoter Margin Capital',
    desc: 'Your own personal capital required to qualify for government subsidy and bank loan.',
  },
  working_capital: {
    plain: 'Day-to-day operating funds',
    technical: 'Working Capital Facility',
    desc: 'Funds needed for daily expenses like raw materials, electricity, and fuel.',
  },
  breakeven: {
    plain: 'Time to cover all monthly costs',
    technical: 'Break-even Horizon',
    desc: 'The month from launch when sales revenue matches total recurring expenses.',
  },
};

export const getRuralFriendlyTerm = (termKey) => {
  return RURAL_FRIENDLY_DICTIONARY[termKey] || {
    plain: termKey,
    technical: termKey,
    desc: '',
  };
};
