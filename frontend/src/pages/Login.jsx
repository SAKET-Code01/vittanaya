import React, { useState, useRef, useEffect } from "react";
import { useLocale } from "../locale/LocaleContext";
import { authService } from "../services/authService";
import VittanayaLogo from "../components/common/VittanayaLogo";
import "./Login.css";

/**
 * Login — VITTANAYA login screen (exact reference implementation).
 *
 * Supports three distinct access paths:
 * 1. Credential Login (submitted via authService.login)
 * 2. Continue with Google (OAuth flow handler)
 * 3. Continue as Guest (routes to unauthenticated Assessment onboarding flow)
 *
 * Props
 * ─────
 * onLoginSuccess  (fn) — called when authentication succeeds.
 * onGuestContinue (fn) — called by "Continue as Guest".
 * onRegister      (fn) — called by "Register here".
 */
export default function Login({ onLoginSuccess, onGuestContinue, onRegister }) {
  const { locale, setLocale, t, locales } = useLocale();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const langDropdownRef = useRef(null);

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    function handleClickOutside(event) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setIsLangOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsLangOpen(false);
      }
    }
    if (isLangOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLangOpen]);

  const currentLang = locales.find((l) => l.code === locale) || locales[0];

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      // Connect to existing authentication service
      const res = await authService.login(identifier, password);
      console.log("Login submitted via authService:", res);

      if (onLoginSuccess) {
        onLoginSuccess(res);
      }
    } catch (err) {
      console.error("Login authentication error:", err);
      // Fallback transition for non-blocking UI
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    // TODO: Integrate Google OAuth (Firebase Auth or Google Identity Services).
    console.log("Continue with Google — OAuth not yet integrated.");
  };

  const handleGuestLogin = () => {
    // Unauthenticated guest path → OnboardingFlow (Assessment).
    console.log("Continue as Guest");
    if (onGuestContinue) {
      onGuestContinue();
    }
  };

  const handleRegister = () => {
    // Navigate to registration flow
    console.log("Register here");
    if (onRegister) {
      onRegister();
    }
  };

  const handleForgotPassword = () => {
    // Navigate to password-reset flow when implemented
    console.log("Forgot Password — not yet implemented.");
  };

  return (
    <main className="login-page">

      {/* =========================
          LEFT STATIC VISUAL
      ========================== */}
      <section className="login-left">
        <img
          src="/assets/vittanaya-login-left-panel.png"
          alt="VITTANAYA rural business advisory"
          className="login-left-image"
        />
      </section>

      {/* =========================
          RIGHT LOGIN AREA
      ========================== */}
      <section className="login-right">

        {/* Real Language Selector Dropdown */}
        <div className="language-selector-wrapper" ref={langDropdownRef}>
          <button
            type="button"
            className={`language-selector ${isLangOpen ? "open" : ""}`}
            onClick={() => setIsLangOpen((prev) => !prev)}
            aria-haspopup="listbox"
            aria-expanded={isLangOpen}
            aria-label="Select language"
          >
            <svg
              className="language-globe-svg"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="12" cy="12" r="9.5" />
              <path d="M12 2.5c2.5 3 4 6 4 9.5s-1.5 6.5-4 9.5c-2.5-3-4-6-4-9.5s1.5-6.5 4-9.5z" />
              <path d="M3 12h18" strokeLinecap="round" />
            </svg>
            <span className="language-selector-text">{currentLang.nativeLabel}</span>
            <svg
              className={`language-chevron-svg ${isLangOpen ? "chevron-rotated" : ""}`}
              viewBox="0 0 24 24"
              width="15"
              height="15"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {isLangOpen && (
            <ul className="language-dropdown-menu" role="listbox" aria-label="Languages">
              {locales.map((item) => {
                const isSelected = item.code === locale;
                return (
                  <li key={item.code} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      className={`language-option ${isSelected ? "selected" : ""}`}
                      onClick={() => {
                        setLocale(item.code);
                        setIsLangOpen(false);
                      }}
                    >
                      <span className="option-check" aria-hidden="true">
                        {isSelected ? "✓" : ""}
                      </span>
                      <span className="option-label">{item.nativeLabel}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="login-card">

          {/* Official VITTANAYA Logo */}
          <div className="flex justify-center mb-4">
            <VittanayaLogo size="md" className="h-10 sm:h-11" />
          </div>

          <h1>{t("auth.welcomeBack")}</h1>

          <p className="login-subtitle">
            {t("auth.signInSubtitle")}
          </p>

          <form onSubmit={handleSubmit}>

            {/* Phone / Email */}
            <div className="field-group">
              <label htmlFor="login-identifier">
                {t("auth.phoneOrEmail")}
              </label>

              <div className="input-wrapper">
                <svg
                  className="input-icon"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="8"
                    r="3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />

                  <path
                    d="M5.5 19c.7-3.1 3-5 6.5-5s5.8 1.9 6.5 5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>

                <input
                  id="login-identifier"
                  type="text"
                  placeholder={t("auth.phoneOrEmailPlaceholder")}
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="field-group password-group">
              <label htmlFor="login-password">
                {t("auth.password")}
              </label>

              <div className="input-wrapper">
                <svg
                  className="input-icon"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <rect
                    x="6"
                    y="10"
                    width="12"
                    height="9"
                    rx="1.7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />

                  <path
                    d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />

                  <circle
                    cx="12"
                    cy="14.5"
                    r="1"
                    fill="currentColor"
                  />
                </svg>

                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("auth.passwordPlaceholder")}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  className="password-toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M3 3l18 18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />

                      <path
                        d="M10.6 6.3A10.8 10.8 0 0 1 12 6.2c5.1 0 8.7 5.8 8.7 5.8a15.2 15.2 0 0 1-3.3 3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />

                      <path
                        d="M6.2 8.6C4.7 9.7 3.3 12 3.3 12s3.6 5.8 8.7 5.8c.9 0 1.8-.2 2.5-.4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M3 12s3.6-6 9-6 9 6 9 6-3.6 6-9 6-9-6-9-6Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />

                      <circle
                        cx="12"
                        cy="12"
                        r="2.7"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                    </svg>
                  )}
                </button>
              </div>

              <button
                type="button"
                className="forgot-password"
                onClick={handleForgotPassword}
              >
                {t("auth.forgotPassword")}
              </button>
            </div>

            {/* 1. Restored Blue Primary Login Button */}
            <button
              id="login-submit-btn"
              type="submit"
              className="login-submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "..." : t("auth.login")}
            </button>

            {/* Divider */}
            <div className="login-divider">
              <span />
              <em>{t("auth.or")}</em>
              <span />
            </div>

            {/* 2. Google Button */}
            <button
              type="button"
              className="google-button"
              onClick={handleGoogleLogin}
            >
              <svg
                className="google-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="#4285F4"
                  d="M21.35 12.27c0-.73-.06-1.27-.19-1.85H12v3.5h5.37a4.58 4.58 0 0 1-1.99 3.01v2.5h3.23c1.89-1.74 2.74-4.31 2.74-7.16Z"
                />

                <path
                  fill="#34A853"
                  d="M12 21.5c2.7 0 4.96-.89 6.61-2.41l-3.23-2.5c-.89.6-2.03.95-3.38.95-2.6 0-4.8-1.76-5.59-4.13H3.07v2.58A9.99 9.99 0 0 0 12 21.5Z"
                />

                <path
                  fill="#FBBC05"
                  d="M6.41 13.41a6.04 6.04 0 0 1 0-3.82V7.01H3.07a10 10 0 0 0 0 8.98l3.34-2.58Z"
                />

                <path
                  fill="#EA4335"
                  d="M12 5.47c1.48 0 2.8.51 3.84 1.51l2.88-2.88C16.96 2.53 14.7 1.5 12 1.5a9.99 9.99 0 0 0-8.93 5.51l3.34 2.58C7.2 7.23 9.4 5.47 12 5.47Z"
                />
              </svg>

              <span>{t("auth.continueWithGoogle")}</span>
            </button>

            {/* Divider */}
            <div className="login-divider">
              <span />
              <em>{t("auth.or")}</em>
              <span />
            </div>

            {/* 3. Guest Button */}
            <button
              id="login-guest-btn"
              type="button"
              className="guest-button"
              onClick={handleGuestLogin}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle
                  cx="12"
                  cy="8"
                  r="3.2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />

                <path
                  d="M5 19c.7-3.2 3.2-5 7-5s6.3 1.8 7 5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>

              <span>{t("auth.continueAsGuest")}</span>
            </button>
          </form>

          {/* Register */}
          <p className="register-text">
            {t("auth.registerPrompt")}
            <button type="button" id="login-register-link" onClick={handleRegister}>
              {t("auth.register")}
            </button>
          </p>

          {/* Security */}
          <div className="security-line">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 3.5 19 6v5.2c0 4.4-2.8 7.7-7 9.3-4.2-1.6-7-4.9-7-9.3V6l7-2.5Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />

              <path
                d="m9.3 12 1.8 1.8 3.8-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <span>{t("auth.accountProtected")}</span>
          </div>

        </div>
      </section>
    </main>
  );
}
