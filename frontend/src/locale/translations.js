/**
 * Locale translations for VITTANAYA.
 *
 * Architecture:
 *   - Each supported locale is a flat object keyed by stable dotted identifiers.
 *   - All keys present in 'en' MUST exist in every other locale.
 *   - If a key is missing from a locale at runtime, the LocaleContext
 *     falls back to the English value automatically.
 *   - To add a new language (e.g. Korean), create a 'ko' object following
 *     the same key structure and add it to SUPPORTED_LOCALES + TRANSLATIONS.
 *
 * Locale codes follow ISO 639-1:
 *   en  — English
 *   hi  — Hindi
 *   or  — Odia
 */

// ── Supported locales registry ──────────────────────────────────────────────

export const SUPPORTED_LOCALES = [
  { code: 'en', label: 'English',  nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi',    nativeLabel: 'हिंदी' },
  { code: 'or', label: 'Odia',     nativeLabel: 'ଓଡ଼ିଆ' },
  // { code: 'ko', label: 'Korean', nativeLabel: '한국어' },
];

export const DEFAULT_LOCALE = 'en';

// ── English ─────────────────────────────────────────────────────────────────

const en = {
  // Auth / Login
  'auth.welcomeBack':         'Welcome Back',
  'auth.signInSubtitle':      'Sign in to continue to your VITTANAYA account',
  'auth.phoneOrEmail':        'Phone Number / Email',
  'auth.phoneOrEmailPlaceholder': 'Enter your phone number or email',
  'auth.password':            'Password',
  'auth.passwordPlaceholder': 'Enter your password',
  'auth.forgotPassword':      'Forgot Password?',
  'auth.login':               'Login',
  'auth.continueWithGoogle':  'Continue with Google',
  'auth.or':                  'or',
  'auth.continueAsGuest':     'Continue as Guest',
  'auth.registerPrompt':      "Don\u2019t have an account?",
  'auth.register':            'Register here',
  'auth.accountProtected':    'Your account information is protected.',

  // Language selector
  'lang.label':               'English',
};

// ── Hindi ───────────────────────────────────────────────────────────────────

const hi = {
  'auth.welcomeBack':         'वापस स्वागत है',
  'auth.signInSubtitle':      'अपने VITTANAYA खाते में जारी रखने के लिए साइन इन करें',
  'auth.phoneOrEmail':        'फ़ोन नंबर / ईमेल',
  'auth.phoneOrEmailPlaceholder': 'अपना फ़ोन नंबर या ईमेल दर्ज करें',
  'auth.password':            'पासवर्ड',
  'auth.passwordPlaceholder': 'अपना पासवर्ड दर्ज करें',
  'auth.forgotPassword':      'पासवर्ड भूल गए?',
  'auth.login':               'लॉग इन करें',
  'auth.continueWithGoogle':  'Google से जारी रखें',
  'auth.or':                  'या',
  'auth.continueAsGuest':     'अतिथि के रूप में जारी रखें',
  'auth.registerPrompt':      'खाता नहीं है?',
  'auth.register':            'यहाँ रजिस्टर करें',
  'auth.accountProtected':    'आपकी खाता जानकारी सुरक्षित है।',

  'lang.label':               'हिंदी',
};

// ── Odia ────────────────────────────────────────────────────────────────────

const or_ = {
  'auth.welcomeBack':         'ପୁଣି ସ୍ୱାଗତ',
  'auth.signInSubtitle':      'ଆପଣଙ୍କ VITTANAYA ଖାତାରେ ଜାରି ରଖିବାକୁ ସାଇନ୍ ଇନ୍ କରନ୍ତୁ',
  'auth.phoneOrEmail':        'ଫୋନ୍ ନମ୍ବର / ଇମେଲ୍',
  'auth.phoneOrEmailPlaceholder': 'ଆପଣଙ୍କ ଫୋନ୍ ନମ୍ବର କିମ୍ବା ଇମେଲ୍ ପ୍ରବେଶ କରନ୍ତୁ',
  'auth.password':            'ପାସୱାର୍ଡ',
  'auth.passwordPlaceholder': 'ଆପଣଙ୍କ ପାସୱାର୍ଡ ପ୍ରବେଶ କରନ୍ତୁ',
  'auth.forgotPassword':      'ପାସୱାର୍ଡ ଭୁଲି ଯାଇଛନ୍ତି?',
  'auth.login':               'ଲଗ୍ ଇନ୍',
  'auth.continueWithGoogle':  'Google ସହ ଜାରି ରଖନ୍ତୁ',
  'auth.or':                  'କିମ୍ବା',
  'auth.continueAsGuest':     'ଅତିଥି ଭାବରେ ଜାରି ରଖନ୍ତୁ',
  'auth.registerPrompt':      'ଖାତା ନାହିଁ?',
  'auth.register':            'ଏଠାରେ ପଞ୍ଜୀକରଣ କରନ୍ତୁ',
  'auth.accountProtected':    'ଆପଣଙ୍କ ଖାତା ସୂଚନା ସୁରକ୍ଷିତ ଅଛି।',

  'lang.label':               'ଓଡ଼ିଆ',
};

// ── Translations map ────────────────────────────────────────────────────────

export const TRANSLATIONS = {
  en,
  hi,
  or: or_,
};
