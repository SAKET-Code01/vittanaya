import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { TRANSLATIONS, DEFAULT_LOCALE, SUPPORTED_LOCALES } from './translations';

/**
 * LocaleContext — Application-level localization state.
 *
 * Provides:
 *   locale        — current locale code ('en' | 'hi' | 'or')
 *   setLocale     — change the active locale (persists to localStorage)
 *   t(key)        — look up a translated string; falls back to English
 *   locales       — SUPPORTED_LOCALES array for building selectors
 *
 * Persistence:
 *   Uses the same localStorage namespace as the rest of the app
 *   (vittanaya_locale). For authenticated users, the preference should
 *   be synced with the backend user-preferences endpoint when available
 *   (PATCH /api/v1/user/preferences { locale }).
 *
 * API integration:
 *   The current locale is readable from this context. Services can
 *   attach `Accept-Language` headers via getLocale() when needed.
 */

const STORAGE_KEY = 'vittanaya_locale';

const LocaleContext = createContext(null);

/**
 * Read the persisted locale from localStorage.
 * Falls back to DEFAULT_LOCALE if none found or invalid.
 */
function readPersistedLocale() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && TRANSLATIONS[saved]) {
      return saved;
    }
  } catch {
    // localStorage unavailable (e.g. SSR or privacy mode)
  }
  return DEFAULT_LOCALE;
}

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(readPersistedLocale);

  const setLocale = useCallback((code) => {
    const validCode = TRANSLATIONS[code] ? code : DEFAULT_LOCALE;
    setLocaleState(validCode);
    try {
      localStorage.setItem(STORAGE_KEY, validCode);
    } catch {
      // silent — localStorage may be unavailable
    }
  }, []);

  /**
   * Translation lookup.
   * Returns the string for `key` in the current locale.
   * Falls back to English if the key is missing in the active locale.
   * Returns the raw key only if English also lacks it (should never happen).
   */
  const t = useCallback((key) => {
    const bundle = TRANSLATIONS[locale] || TRANSLATIONS[DEFAULT_LOCALE];
    if (bundle[key] !== undefined) return bundle[key];
    // Fallback to English
    const fallback = TRANSLATIONS[DEFAULT_LOCALE];
    if (fallback[key] !== undefined) return fallback[key];
    // Last resort — return the key itself (should not happen in production)
    return key;
  }, [locale]);

  const value = useMemo(() => ({
    locale,
    setLocale,
    t,
    locales: SUPPORTED_LOCALES,
  }), [locale, setLocale, t]);

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}

/**
 * Hook to access the locale context.
 */
export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return ctx;
}

/**
 * Utility for services: read the current persisted locale synchronously
 * without needing React context (for Accept-Language headers, etc.).
 */
export function getLocale() {
  return readPersistedLocale();
}
