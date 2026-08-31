/**
 * Locale translations for VITTANAYA.
 *
 * Architecture:
 *   - Each supported locale is a flat object keyed by stable dotted identifiers.
 *   - All keys present in 'en' MUST exist in every other locale.
 *   - If a key is missing from a locale at runtime, LocaleContext falls back to 'en'.
 *
 * Locale codes follow ISO 639-1:
 *   en  — English
 *   hi  — Hindi
 *   or  — Odia
 */

export const SUPPORTED_LOCALES = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी' },
  { code: 'or', label: 'Odia', nativeLabel: 'ଓଡ଼ିଆ' },
];

export const DEFAULT_LOCALE = 'en';

// ── English ─────────────────────────────────────────────────────────────────

const en = {
  // Auth / Login
  'auth.welcomeBack': 'Welcome Back',
  'auth.signInSubtitle': 'Sign in to continue to your VITTANAYA account',
  'auth.phoneOrEmail': 'Phone Number / Email',
  'auth.phoneOrEmailPlaceholder': 'Enter your phone number or email',
  'auth.password': 'Password',
  'auth.passwordPlaceholder': 'Enter your password',
  'auth.forgotPassword': 'Forgot Password?',
  'auth.login': 'Login',
  'auth.continueWithGoogle': 'Continue with Google',
  'auth.or': 'or',
  'auth.continueAsGuest': 'Continue as Guest',
  'auth.registerPrompt': "Don't have an account?",
  'auth.register': 'Register here',
  'auth.accountProtected': 'Your account information is protected.',

  // Common Nav & Journey
  'nav.dashboard': 'Dashboard',
  'nav.businessProfile': 'Business Profile',
  'nav.feasibility': 'Feasibility',
  'nav.financialPlan': 'Financial Plan',
  'nav.scheme': 'Government Schemes',
  'nav.actionPlan': 'Action Plan',
  'nav.logout': 'Sign Out',

  // Dashboard Metrics
  'dash.marginCapital': 'Own Margin Capital',
  'dash.subsidyEligibility': 'Subsidy Eligibility',
  'dash.maxProjectSize': 'Max Project Size',
  'dash.breakeven': 'Break-even Horizon',
  'dash.businessReadiness': 'Business Readiness',
  'dash.fundingReadiness': 'Funding Readiness',
  'dash.businessRisk': 'Business Risk',
  'dash.marketPotential': 'Local Market Potential',

  // Common Actions & States
  'common.loading': 'Loading information...',
  'common.retry': 'Retry',
  'common.continue': 'Continue',
  'common.viewReport': 'View Report',
  'common.whyThisScore': 'Why this score?',
  'common.verified': 'Verified',
  'common.estimated': 'Estimated',
  'common.userProvided': 'User Provided',
  'common.limitedConfidence': 'Limited Confidence',

  // Language selector
  'lang.label': 'English',
};

// ── Hindi ───────────────────────────────────────────────────────────────────

const hi = {
  // Auth / Login
  'auth.welcomeBack': 'वापस स्वागत है',
  'auth.signInSubtitle': 'अपने VITTANAYA खाते में जारी रखने के लिए साइन इन करें',
  'auth.phoneOrEmail': 'फ़ोन नंबर / ईमेल',
  'auth.phoneOrEmailPlaceholder': 'अपना फ़ोन नंबर या ईमेल दर्ज करें',
  'auth.password': 'पासवर्ड',
  'auth.passwordPlaceholder': 'अपना पासवर्ड दर्ज करें',
  'auth.forgotPassword': 'पासवर्ड भूल गए?',
  'auth.login': 'लॉग इन करें',
  'auth.continueWithGoogle': 'Google से जारी रखें',
  'auth.or': 'या',
  'auth.continueAsGuest': 'अतिथि के रूप में जारी रखें',
  'auth.registerPrompt': 'खाता नहीं है?',
  'auth.register': 'यहाँ रजिस्टर करें',
  'auth.accountProtected': 'आपकी खाता जानकारी सुरक्षित है।',

  // Common Nav & Journey
  'nav.dashboard': 'डैशबोर्ड',
  'nav.businessProfile': 'व्यापार प्रोफ़ाइल',
  'nav.feasibility': 'व्यावहारिकता',
  'nav.financialPlan': 'वित्तीय योजना',
  'nav.scheme': 'सरकारी योजनाएँ',
  'nav.actionPlan': 'कार्य योजना',
  'nav.logout': 'साइन आउट',

  // Dashboard Metrics
  'dash.marginCapital': 'स्वयं की मार्जिन पूंजी',
  'dash.subsidyEligibility': 'सब्सिडी पात्रता',
  'dash.maxProjectSize': 'अधिकतम परियोजना आकार',
  'dash.breakeven': 'ब्रेक-इवन अवधि',
  'dash.businessReadiness': 'व्यापार तत्परता',
  'dash.fundingReadiness': 'वित्त पोषण तत्परता',
  'dash.businessRisk': 'व्यापार जोखिम',
  'dash.marketPotential': 'स्थानीय बाजार क्षमता',

  // Common Actions & States
  'common.loading': 'जानकारी लोड हो रही है...',
  'common.retry': 'पुनः प्रयास करें',
  'common.continue': 'आगे बढ़ें',
  'common.viewReport': 'रिपोर्ट देखें',
  'common.whyThisScore': 'यह स्कोर क्यों?',
  'common.verified': 'सत्यापित',
  'common.estimated': 'अनुमानित',
  'common.userProvided': 'उपयोगकर्ता द्वारा प्रदान',
  'common.limitedConfidence': 'सीमित विश्वास',

  'lang.label': 'हिंदी',
};

// ── Odia ────────────────────────────────────────────────────────────────────

const or_ = {
  // Auth / Login
  'auth.welcomeBack': 'ପୁଣି ସ୍ୱାଗତ',
  'auth.signInSubtitle': 'ଆପଣଙ୍କ VITTANAYA ଖାତାରେ ଜାରି ରଖିବାକୁ ସାଇନ୍ ଇନ୍ କରନ୍ତୁ',
  'auth.phoneOrEmail': 'ଫୋନ୍ ନମ୍ବର / ଇମେଲ୍',
  'auth.phoneOrEmailPlaceholder': 'ଆପଣଙ୍କ ଫୋନ୍ ନମ୍ବର କିମ୍ବା ଇମେଲ୍ ପ୍ରବେଶ କରନ୍ତୁ',
  'auth.password': 'ପାସୱାର୍ଡ',
  'auth.passwordPlaceholder': 'ଆପଣଙ୍କ ପାସୱାର୍ଡ ପ୍ରବେଶ କରନ୍ତୁ',
  'auth.forgotPassword': 'ପାସୱାର୍ଡ ଭୁଲି ଯାଇଛନ୍ତି?',
  'auth.login': 'ଲଗ୍ ଇନ୍',
  'auth.continueWithGoogle': 'Google ସହ ଜାରି ରଖନ୍ତୁ',
  'auth.or': 'କିମ୍ବା',
  'auth.continueAsGuest': 'ଅତିଥି ଭାବରେ ଜାରି ରଖନ୍ତୁ',
  'auth.registerPrompt': 'ଖାତା ନାହିଁ?',
  'auth.register': 'ଏଠାରେ ପଞ୍ଜୀକରଣ କରନ୍ତୁ',
  'auth.accountProtected': 'ଆପଣଙ୍କ ଖାତା ସୂଚନା ସୁରକ୍ଷିତ ଅଛି।',

  // Common Nav & Journey
  'nav.dashboard': 'ଡ୍ୟାସବୋର୍ଡ',
  'nav.businessProfile': 'ବ୍ୟବସାୟ ପ୍ରୋଫାଇଲ୍',
  'nav.feasibility': 'ବ୍ୟବହାର୍ଯ୍ୟତା',
  'nav.financialPlan': 'ଆର୍ଥିକ ଯୋଜନା',
  'nav.scheme': 'ସରକାରୀ ଯୋଜନା',
  'nav.actionPlan': 'କାର୍ଯ୍ୟ ଯୋଜନା',
  'nav.logout': 'ସାଇନ୍ ଆଉଟ୍',

  // Dashboard Metrics
  'dash.marginCapital': 'ନିଜର ମାର୍ଜିନ ପୁଞ୍ଜି',
  'dash.subsidyEligibility': 'ସବସିଡି ଯୋଗ୍ୟତା',
  'dash.maxProjectSize': 'ସର୍ବାଧିକ ପ୍ରକଳ୍ପ ଆକାର',
  'dash.breakeven': 'ଲାଭ-କ୍ଷତି ସମାନ ସମୟ',
  'dash.businessReadiness': 'ବ୍ୟବସାୟ ପ୍ରସ୍ତୁତି',
  'dash.fundingReadiness': 'ପାଣ୍ଠି ପ୍ରସ୍ତୁତି',
  'dash.businessRisk': 'ବ୍ୟବସାୟ ବିପଦ',
  'dash.marketPotential': 'ସ୍ଥାନୀୟ ବଜାର ସମ୍ଭାବନା',

  // Common Actions & States
  'common.loading': 'ତଥ୍ୟ ଲୋଡ୍ ହେଉଛି...',
  'common.retry': 'ପୁନର୍ବାର ଚେଷ୍ଟା କରନ୍ତୁ',
  'common.continue': 'ଆଗକୁ ବଢ଼ନ୍ତୁ',
  'common.viewReport': 'ରିପୋର୍ଟ ଦେଖନ୍ତୁ',
  'common.whyThisScore': 'ଏହି ସ୍କୋର କାହିଁକି?',
  'common.verified': 'ଯାଞ୍ଚ ହୋଇଛି',
  'common.estimated': 'ଆନୁମାନିକ',
  'common.userProvided': 'ବ୍ୟବହାରକାରୀଙ୍କ ଦ୍ୱାରା ପ୍ରଦତ୍ତ',
  'common.limitedConfidence': 'ସୀମିତ ବିଶ୍ୱାସ',

  'lang.label': 'ଓଡ଼ିଆ',
};

// ── Translations map ────────────────────────────────────────────────────────

export const TRANSLATIONS = {
  en,
  hi,
  or: or_,
};
