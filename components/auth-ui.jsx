"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Github,
  KeyRound,
  Lock,
  Mail,
  RefreshCw,
  ShieldCheck,
  User,
  UserRound,
  X
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function AuthShell({ children }) {
  return (
    <section className="auth-page">
      <div className="auth-topbar">
        <Link className="logo" href="/">
          <span className="logo-mark">D</span>
          <span className="font-display">Devflow AI</span>
        </Link>
        <div className="row" style={{ gap: 10 }}>
          <ThemeToggle />
          <Link className="btn btn-outline" href="/"><ArrowLeft size={17} /> Back to Home</Link>
        </div>
      </div>
      <div className="auth-grid">
        <BrandPanel />
        <div className="auth-card-wrap">{children}</div>
      </div>
      <footer className="auth-footer">
        <span>Copyright 2026 Devflow AI</span>
        <span className="row wrap" style={{ gap: 12 }}>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/contact">Support</Link>
        </span>
      </footer>
    </section>
  );
}

export function BrandPanel() {
  return (
    <aside className="auth-brand">
      <div className="stack-lg">
        <div className="stack">
          <span className="logo-mark" style={{ width: 52, height: 52 }}>D</span>
          <span className="eyebrow">Secure AI Workspace</span>
          <h1 className="h2">Build Faster. Ship Smarter.</h1>
          <p className="lead">Sign in to a developer workspace built for AI-assisted planning, secure collaboration, and focused delivery.</p>
        </div>
        <div className="auth-preview floating">
          <div className="row between">
            <span className="badge"><ShieldCheck size={15} /> Secure Login</span>
            <span className="badge"><Lock size={15} /> Encrypted</span>
          </div>
          <div className="terminal">
            <div>$ devflow auth verify</div>
            <div style={{ color: "var(--success)" }}>session encrypted / device trusted</div>
            <div>$ ai.workspace.open</div>
            <div style={{ color: "var(--info)" }}>context synced in 320ms</div>
          </div>
          <div className="grid grid-2">
            <div className="card card-pad floating delay-1">
              <strong>AI Review</strong>
              <p className="muted">3 risks found, 2 fixes suggested.</p>
            </div>
            <div className="card card-pad floating delay-2">
              <strong>Deploy Health</strong>
              <p className="muted">All checks passing.</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function AuthCard({ title, subtitle, children }) {
  return (
    <div className="auth-card">
      <div className="stack" style={{ textAlign: "center" }}>
        <h2 className="h2">{title}</h2>
        <p className="muted">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

export function AuthInput({ icon: Icon = Mail, label, type = "text", value, onChange, placeholder, validation, withPasswordToggle = false }) {
  const [visible, setVisible] = useState(false);
  const inputType = withPasswordToggle ? (visible ? "text" : "password") : type;

  return (
    <label className="form-field">
      <span>{label}</span>
      <span className="auth-input-wrap">
        <Icon className="soft" size={18} />
        <input className="auth-input" placeholder={placeholder ?? label} type={inputType} value={value} onChange={onChange} />
        {withPasswordToggle ? (
          <button aria-label={visible ? "Hide password" : "Show password"} className="auth-input-action" onClick={() => setVisible((current) => !current)} type="button">
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        ) : null}
      </span>
      {validation ? <span className={validation.ok ? "auth-valid" : "auth-invalid"}>{validation.text}</span> : null}
    </label>
  );
}

export function AuthDivider() {
  return (
    <div className="auth-divider">
      <span />
      <small>or continue with</small>
      <span />
    </div>
  );
}

export function SocialButtons() {
  return (
    <div className="grid grid-2">
      <button className="btn btn-outline" type="button"><GoogleIcon /> Google</button>
      <button className="btn btn-outline" type="button"><Github size={18} /> GitHub</button>
    </div>
  );
}

export function SubmitButton({ children, loading = false, disabled = false, onClick }) {
  return (
    <button className="btn btn-primary auth-submit" disabled={disabled || loading} onClick={onClick} type="button">
      {loading ? <span className="spinner" /> : null}
      {children}
    </button>
  );
}

export function PasswordStrength({ password }) {
  const checks = getPasswordChecks(password);
  const passed = checks.filter((check) => check.ok).length;
  const labels = ["Weak", "Weak", "Medium", "Strong", "Very Strong", "Very Strong"];
  const width = `${Math.max(12, passed * 20)}%`;

  return (
    <div className="stack">
      <div className="row between">
        <span className="soft">Password strength</span>
        <strong style={{ color: passed > 3 ? "var(--success)" : passed > 2 ? "var(--warning)" : "var(--danger)" }}>{labels[passed]}</strong>
      </div>
      <div className="strength-track"><span style={{ width }} /></div>
      <div className="grid grid-2">
        {checks.map((check) => (
          <span className={check.ok ? "auth-valid" : "auth-invalid"} key={check.label}>
            {check.ok ? <Check size={14} /> : <X size={14} />} {check.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function VerifyPanel() {
  const [verified, setVerified] = useState(false);

  return (
    <div className="stack-lg center" style={{ textAlign: "center" }}>
      <div className={`verify-illustration ${verified ? "success" : ""}`}>
        {verified ? <CheckCircle2 size={64} /> : <Mail size={64} />}
      </div>
      {verified ? (
        <>
          <h3 className="h3">Email Verified Successfully</h3>
          <p className="muted">Redirecting to your dashboard.</p>
          <Link className="btn btn-primary auth-submit" href="/login">Continue to Login</Link>
        </>
      ) : (
        <>
          <p className="muted">We have sent a verification link to</p>
          <strong>aman@example.com</strong>
          <div className="card card-pad" style={{ width: "100%" }}>
            <span className="soft">Resend available in</span>
            <strong className="font-display" style={{ display: "block", fontSize: 32 }}>45 seconds</strong>
          </div>
          <div className="grid grid-2" style={{ width: "100%" }}>
            <button className="btn btn-outline" type="button"><RefreshCw size={17} /> Resend Email</button>
            <button className="btn btn-outline" type="button">Change Email</button>
          </div>
          <button className="btn btn-primary auth-submit" onClick={() => setVerified(true)} type="button">Open Gmail</button>
        </>
      )}
    </div>
  );
}

export function ForgotSuccess() {
  return (
    <div className="stack-lg center" style={{ textAlign: "center" }}>
      <div className="verify-illustration"><Mail size={64} /></div>
      <h3 className="h3">Password reset email sent.</h3>
      <p className="muted">Check your inbox for a secure reset link.</p>
      <div className="grid grid-2" style={{ width: "100%" }}>
        <button className="btn btn-primary" type="button">Open Email</button>
        <Link className="btn btn-outline" href="/login">Back to Login</Link>
      </div>
    </div>
  );
}

export function OtpInput() {
  const [values, setValues] = useState(["", "", "", "", "", ""]);
  const refs = useRef([]);
  const complete = values.every(Boolean);

  function updateValue(index, nextValue) {
    const digit = nextValue.replace(/\D/g, "").slice(-1);
    const next = [...values];
    next[index] = digit;
    setValues(next);
    if (digit && index < refs.current.length - 1) {
      refs.current[index + 1]?.focus();
    }
  }

  function handlePaste(event) {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    event.preventDefault();
    const next = Array.from({ length: 6 }, (_, index) => pasted[index] ?? "");
    setValues(next);
    refs.current[Math.min(pasted.length, 5)]?.focus();
  }

  function handleKeyDown(event, index) {
    if (event.key === "Backspace" && !values[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  }

  return (
    <div className="stack-lg">
      <div className="otp-row" onPaste={handlePaste}>
        {values.map((value, index) => (
          <input
            aria-label={`Digit ${index + 1}`}
            className="otp-box"
            inputMode="numeric"
            key={index}
            maxLength={1}
            onChange={(event) => updateValue(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            ref={(node) => { refs.current[index] = node; }}
            value={value}
          />
        ))}
      </div>
      <div className="card card-pad center stack" style={{ textAlign: "center" }}>
        <span className="soft">Code expires in</span>
        <strong className="font-display" style={{ fontSize: 32 }}>01:59</strong>
      </div>
      <SubmitButton disabled={!complete}>Verify Code</SubmitButton>
      {complete ? (
        <div className="auth-success"><BadgeCheck size={18} /> Authentication Successful. Redirecting to Dashboard.</div>
      ) : null}
    </div>
  );
}

export function RegisterValidation({ username, email, password }) {
  const validations = useMemo(() => [
    { label: "Username available", ok: username.length >= 4 },
    { label: "Valid email", ok: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) },
    { label: "Password length", ok: password.length >= 8 },
    { label: "Special character", ok: /[^A-Za-z0-9]/.test(password) },
    { label: "Number", ok: /\d/.test(password) },
    { label: "Uppercase", ok: /[A-Z]/.test(password) }
  ], [email, password, username]);

  return (
    <div className="grid grid-2">
      {validations.map((item) => (
        <span className={item.ok ? "auth-valid" : "auth-invalid"} key={item.label}>
          {item.ok ? <Check size={14} /> : <X size={14} />} {item.label}
        </span>
      ))}
    </div>
  );
}

export function getPasswordChecks(password) {
  return [
    { label: "8+ Characters", ok: password.length >= 8 },
    { label: "One Uppercase", ok: /[A-Z]/.test(password) },
    { label: "One Lowercase", ok: /[a-z]/.test(password) },
    { label: "Number", ok: /\d/.test(password) },
    { label: "Special Character", ok: /[^A-Za-z0-9]/.test(password) }
  ];
}

export const authIcons = {
  KeyRound,
  Lock,
  Mail,
  User,
  UserRound
};

function GoogleIcon() {
  return (
    <svg aria-hidden="true" height="18" viewBox="0 0 24 24" width="18">
      <path d="M21.6 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h5.4c-.2 1.2-.9 2.3-2 3v2.4h3.2c1.9-1.7 3-4.2 3-7.1Z" fill="#4285F4" />
      <path d="M12 22c2.7 0 5-.9 6.6-2.6l-3.2-2.4c-.9.6-2 .9-3.4.9-2.6 0-4.8-1.8-5.6-4.1H3.1v2.5C4.7 19.7 8.1 22 12 22Z" fill="#34A853" />
      <path d="M6.4 13.8c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8V7.7H3.1C2.4 9 2 10.5 2 12s.4 3 1.1 4.3l3.3-2.5Z" fill="#FBBC05" />
      <path d="M12 6.1c1.5 0 2.8.5 3.8 1.5l2.8-2.8C17 3.1 14.7 2 12 2 8.1 2 4.7 4.3 3.1 7.7l3.3 2.5C7.2 7.9 9.4 6.1 12 6.1Z" fill="#EA4335" />
    </svg>
  );
}
