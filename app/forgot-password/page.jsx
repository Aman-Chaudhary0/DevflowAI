"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail } from "lucide-react";
import { AuthCard, AuthInput, AuthShell, SubmitButton, authIcons } from "@/components/auth-ui";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  // ForgotPasswordPage is a page component that renders the "Forgot Password" form, allowing users to request a password reset link by entering their email address. It displays a success message after the reset link is sent, with options to open the email or return to the login page.
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <AuthCard title="Forgot Password?" subtitle="No worries. We will send you a reset link.">
        {sent ? (
          <div className="stack-lg center" style={{ textAlign: "center" }}>
            <div className="verify-illustration"><Mail size={64} /></div>
            <h3 className="h3">Password reset email sent.</h3>
            <p className="muted">Check your inbox at <strong>{email}</strong> for a secure reset link.</p>
            <div className="grid grid-2" style={{ width: "100%" }}>
              <button className="btn btn-primary" onClick={() => setSent(false)} type="button">Try Again</button>
              <Link className="btn btn-outline" href="/login">Back to Login</Link>
            </div>
          </div>
        ) : (
          <form className="stack-lg" onSubmit={handleSubmit}>
            <AuthInput
              icon={authIcons.Mail}
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="aman@example.com"
            />
            {error ? <p style={{ color: "var(--danger)", fontSize: 14 }}>{error}</p> : null}
            <SubmitButton loading={loading}>Send Reset Link</SubmitButton>
            <Link className="btn btn-outline" href="/login">Back to Login</Link>
          </form>
        )}
      </AuthCard>
    </AuthShell>
  );
}
