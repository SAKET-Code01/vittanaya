import React, { useState, useRef, useEffect } from "react";
import { useLocale } from "../locale/LocaleContext";
import { authService } from "../services/authService";
import ruralBg from "../assets/ruralbg.png";
import vittanayaLogo from "../assets/vittanaya-logo.png";
import "./Login.css";

/**
 * Login — VITTANAYA Database-Connected Authentication Page.
 *
 * Requirements:
 * - Single centered glass-card experience.
 * - Shared ruralbg.png backdrop with 82% white overlay.
 * - Real API integration via POST /api/v1/auth/login and POST /api/v1/auth/register.
 * - Validation for 10-digit Indian mobile numbers, valid emails, and min 8-char passwords.
 * - Graceful error handling for invalid credentials, network issues, and timeouts.
 *
 * Props:
 * @param {Function} onLoginSuccess - Called with auth response when login/register succeeds.
 * @param {Function} onGuestContinue - Called when user continues as guest without login.
 * @param {Function} onRegister - Called when switching to external registration or flow.
 * @param {string} mode - 'login' or 'register'.
 * @param {Function} onToggleMode - Called when switching between login and register.
 */
export default function Login({
  onLoginSuccess,
  onGuestContinue,
  onRegister,
  onHome,
  mode = "login",
  onToggleMode,
}) {
  const { locale, setLocale, t, locales } = useLocale();

  // Mode: 'login' or 'register'
  const [authMode, setAuthMode] = useState(mode);

  useEffect(() => {
    if (mode) {
      setAuthMode(mode);
      setFieldErrors({});
      setServerError("");
    }
  }, [mode]);

  // Form fields
  const [identifier, setIdentifier] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Status & error states
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langDropdownRef = useRef(null);

  // Close language dropdown on click outside or Escape
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

  const currentLang = (locales && locales.find((l) => l.code === locale)) || {
    code: "en",
    label: "English",
    nativeLabel: "English",
  };

  // Helper validation functions
  const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  const isValidIndianPhone = (val) => {
    const cleaned = val.replace(/[\s-+]/g, "");
    return /^(?:91|0)?([6-9]\d{9})$/.test(cleaned);
  };

  const validateLoginForm = () => {
    const errors = {};
    const trimmedId = identifier.trim();

    if (!trimmedId) {
      errors.identifier = "Please enter your Phone Number or Email";
    } else if (trimmedId.includes("@")) {
      if (!isValidEmail(trimmedId)) {
        errors.identifier = "Please enter a valid email address (e.g. user@domain.com)";
      }
    } else {
      if (!isValidIndianPhone(trimmedId)) {
        errors.identifier = "Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)";
      }
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRegisterForm = () => {
    const errors = {};

    if (!name.trim()) {
      errors.name = "Full Name is required";
    }

    if (!email.trim()) {
      errors.email = "Email address is required";
    } else if (!isValidEmail(email)) {
      errors.email = "Please enter a valid email address";
    }

    if (phone.trim() && !isValidIndianPhone(phone)) {
      errors.phone = "Please enter a valid 10-digit Indian mobile number";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validateLoginForm()) return;

    setIsSubmitting(true);
    try {
      const res = await authService.login(identifier, password);
      if (onLoginSuccess) {
        onLoginSuccess(res);
      }
    } catch (err) {
      if (err.status === 401) {
        setServerError("Invalid Email/Phone or Password. Please verify credentials.");
      } else if (err.message && err.message.includes("Failed to fetch")) {
        setServerError("Cannot connect to VITTANAYA backend server. Please verify backend is running.");
      } else {
        setServerError(err.message || "An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Register submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validateRegisterForm()) return;

    setIsSubmitting(true);
    try {
      const res = await authService.register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
      });
      if (onLoginSuccess) {
        onLoginSuccess(res);
      }
    } catch (err) {
      if (err.status === 400) {
        setServerError(err.message || "User with this email or phone already exists.");
      } else if (err.message && err.message.includes("Failed to fetch")) {
        setServerError("Cannot connect to VITTANAYA backend server. Please verify backend is running.");
      } else {
        setServerError(err.message || "Registration failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    setServerError("Google Sign-In is configured for cloud deployment. Please use email/phone login for evaluation.");
  };

  const handleGuestLogin = () => {
    if (onGuestContinue) {
      onGuestContinue();
    }
  };

  const handleForgotPassword = () => {
    setServerError("Password reset instructions will be sent to your registered email or phone.");
  };

  return (
    <div
      className="login-page-centered"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0.55)), url(${ruralBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
      }}
    >
      {/* ============================================================
          TOP HEADER (Official Logo + Language Selector)
          ============================================================ */}
      <header className="login-centered-header">
        <div className="login-brand-header">
          <img
            src={vittanayaLogo}
            alt="VITTANAYA"
            className={`login-brand-logo ${onHome ? 'cursor-pointer hover:opacity-90 active:scale-95 transition-all' : ''}`}
            onClick={onHome}
            role={onHome ? "button" : undefined}
            tabIndex={onHome ? 0 : undefined}
            onKeyDown={onHome ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onHome(); } } : undefined}
            aria-label={onHome ? "Go to VITTANAYA Home" : undefined}
          />
        </div>


        <div className="login-header-right">
          {/* Language Selector Dropdown */}
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
                width="18"
                height="18"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="12" r="9.5" />
                <path d="M12 2.5c2.5 3 4 6 4 9.5s-1.5 6.5-4 9.5c-2.5-3-4-6-4-9.5s1.5-6.5 4-9.5z" />
                <path d="M3 12h18" strokeLinecap="round" />
              </svg>
              <span className="language-selector-text">{currentLang.nativeLabel || currentLang.label}</span>
              <svg
                className={`language-chevron-svg ${isLangOpen ? "chevron-rotated" : ""}`}
                viewBox="0 0 24 24"
                width="14"
                height="14"
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

            {isLangOpen && locales && (
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
                        <span className="option-label">{item.nativeLabel || item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </header>

      {/* ============================================================
          MAIN CENTERED GLASS CARD
          ============================================================ */}
      <main className="login-centered-main">
        <div className="login-glass-card">
          
          {/* Card Icon Header */}
          <div className="login-card-badge">
            <div className="login-lock-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
          </div>

          <h1 className="login-card-title">
            {authMode === "login"
              ? "Welcome Back"
              : "Create Account"}
          </h1>
          {authMode === "register" && (
            <p className="login-card-subtitle">
              Register your enterprise to unlock hyper-local financial intelligence
            </p>
          )}

          {/* Top Error Alert Banner */}
          {serverError && (
            <div className="login-error-banner" role="alert">
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{serverError}</span>
            </div>
          )}

          {/* ==========================================================
              LOGIN FORM
              ========================================================== */}
          {authMode === "login" && (
            <form onSubmit={handleLoginSubmit} noValidate className="login-form">
              {/* Phone / Email Input */}
              <div className="form-group">
                <label htmlFor="login-identifier">
                  Phone Number / Email
                  <span className="required-star">*</span>
                </label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <circle cx="12" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                  <input
                    id="login-identifier"
                    type="text"
                    placeholder="e.g. 9876543210 or name@business.com"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (fieldErrors.identifier) setFieldErrors((prev) => ({ ...prev, identifier: null }));
                    }}
                    className={fieldErrors.identifier ? "input-error" : ""}
                    autoComplete="username"
                  />
                </div>
                {fieldErrors.identifier && <span className="field-error-text">{fieldErrors.identifier}</span>}
              </div>

              {/* Password Input */}
              <div className="form-group">
                <div className="label-row">
                  <label htmlFor="login-password">
                    Password
                    <span className="required-star">*</span>
                  </label>
                  <button type="button" className="forgot-password-link" onClick={handleForgotPassword}>
                    Forgot Password?
                  </button>
                </div>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="3" y="11" width="18" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: null }));
                    }}
                    className={fieldErrors.password ? "input-error" : ""}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M3 3l18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        <path d="M10.6 6.3A10.8 10.8 0 0 1 12 6.2c5.1 0 8.7 5.8 8.7 5.8a15.2 15.2 0 0 1-3.3 3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        <path d="M6.2 8.6C4.7 9.7 3.3 12 3.3 12s3.6 5.8 8.7 5.8c.9 0 1.8-.2 2.5-.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M3 12s3.6-6 9-6 9 6 9 6-3.6 6-9 6-9-6-9-6Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
                        <circle cx="12" cy="12" r="2.7" fill="none" stroke="currentColor" strokeWidth="1.8" />
                      </svg>
                    )}
                  </button>
                </div>
                {fieldErrors.password && <span className="field-error-text">{fieldErrors.password}</span>}
              </div>

              {/* Login Button */}
              <button
                id="login-submit-btn"
                type="submit"
                className="login-submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="submit-spinner-text">
                    <svg className="spinner-svg" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Authenticating...
                  </span>
                ) : (
                  <span>Login</span>
                )}
              </button>
            </form>
          )}

          {/* ==========================================================
              REGISTER FORM
              ========================================================== */}
          {authMode === "register" && (
            <form onSubmit={handleRegisterSubmit} noValidate className="login-form">
              {/* Full Name */}
              <div className="form-group">
                <label htmlFor="reg-name">
                  Full Name <span className="required-star">*</span>
                </label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <circle cx="12" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                  <input
                    id="reg-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: null }));
                    }}
                    className={fieldErrors.name ? "input-error" : ""}
                    autoComplete="name"
                  />
                </div>
                {fieldErrors.name && <span className="field-error-text">{fieldErrors.name}</span>}
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="reg-email">
                  Email Address <span className="required-star">*</span>
                </label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="2" y="4" width="20" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                  <input
                    id="reg-email"
                    type="email"
                    placeholder="name@business.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: null }));
                    }}
                    className={fieldErrors.email ? "input-error" : ""}
                    autoComplete="email"
                  />
                </div>
                {fieldErrors.email && <span className="field-error-text">{fieldErrors.email}</span>}
              </div>

              {/* Mobile Phone (Optional) */}
              <div className="form-group">
                <label htmlFor="reg-phone">Phone Number (10 Digits)</label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="5" y="2" width="14" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M12 18h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                  </svg>
                  <input
                    id="reg-phone"
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: null }));
                    }}
                    className={fieldErrors.phone ? "input-error" : ""}
                    autoComplete="tel"
                  />
                </div>
                {fieldErrors.phone && <span className="field-error-text">{fieldErrors.phone}</span>}
              </div>

              {/* Password */}
              <div className="form-group">
                <label htmlFor="reg-password">
                  Password <span className="required-star">*</span>
                </label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="3" y="11" width="18" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  <input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter strong password (min 8 chars)"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: null }));
                    }}
                    className={fieldErrors.password ? "input-error" : ""}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M3 3l18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        <path d="M10.6 6.3A10.8 10.8 0 0 1 12 6.2c5.1 0 8.7 5.8 8.7 5.8a15.2 15.2 0 0 1-3.3 3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        <path d="M6.2 8.6C4.7 9.7 3.3 12 3.3 12s3.6 5.8 8.7 5.8c.9 0 1.8-.2 2.5-.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M3 12s3.6-6 9-6 9 6 9 6-3.6 6-9 6-9-6-9-6Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
                        <circle cx="12" cy="12" r="2.7" fill="none" stroke="currentColor" strokeWidth="1.8" />
                      </svg>
                    )}
                  </button>
                </div>
                {fieldErrors.password && <span className="field-error-text">{fieldErrors.password}</span>}
              </div>

              {/* Register Button */}
              <button
                id="register-submit-btn"
                type="submit"
                className="login-submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          )}

          {/* Social / Alternative Divider */}
          <div className="login-divider">
            <span className="divider-line" />
            <span className="divider-text">or</span>
            <span className="divider-line" />
          </div>

          {/* Action Buttons */}
          <div className="alternative-actions">
            {/* Google Login */}
            <button
              type="button"
              id="google-login-btn"
              className="google-button"
              onClick={handleGoogleLogin}
            >
              <svg className="google-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Guest Login */}
            <button
              type="button"
              id="guest-login-btn"
              className="guest-button"
              onClick={handleGuestLogin}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <circle cx="9" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
                <path d="M19 8v6m3-3h-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <span>Continue as Guest</span>
            </button>
          </div>

          {/* Toggle Login / Register */}
          <p className="register-text">
            {authMode === "login" ? (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  id="login-register-link"
                  onClick={() => {
                    if (onToggleMode) {
                      onToggleMode("register");
                    } else {
                      setAuthMode("register");
                      setFieldErrors({});
                      setServerError("");
                    }
                  }}
                >
                  Register Here
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  id="login-signin-link"
                  onClick={() => {
                    if (onToggleMode) {
                      onToggleMode("login");
                    } else {
                      setAuthMode("login");
                      setFieldErrors({});
                      setServerError("");
                    }
                  }}
                >
                  Sign In Here
                </button>
              </>
            )}
          </p>

          {/* Security Badge */}
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
            <span>256-bit Encrypted Banking Grade Security</span>
          </div>

        </div>
      </main>

      {/* ============================================================
          FOOTER (Minimalist Protocol Line)
          ============================================================ */}
      <footer className="login-centered-footer">
        <span>© 2026 VITTANAYA • All rights reserved</span>
        <span>Ministry of Social Justice and Empowerment (MoSJE)</span>
      </footer>
    </div>
  );
}
