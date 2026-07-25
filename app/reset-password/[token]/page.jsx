"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { AuthCard, AuthInput, AuthShell, PasswordStrength, SubmitButton, authIcons } from "@/components/auth-ui";
import { api } from "@/lib/api";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) return setError("Passwords do not match.");

    setLoading(true);
    try {
      await api.resetPassword({ token, password, confirmPassword });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <AuthCard title="Create New Password" subtitle="Choose a strong password for your account.">
        {success ? (
          <div className="stack-lg center" style={{ textAlign: "center" }}>
            <div className="verify-illustration success"><CheckCircle2 size={64} /></div>
            <h3 className="h3">Password Changed Successfully</h3>
            <p className="muted">You can now sign in with your new password.</p>
            <Link className="btn btn-primary auth-submit" href="/login">Continue to Login</Link>
          </div>
        ) : (
          <form className="stack-lg" onSubmit={handleSubmit}>
            <AuthInput
              icon={authIcons.Lock}
              label="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              withPasswordToggle
            />
            <AuthInput
              icon={authIcons.KeyRound}
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              withPasswordToggle
            />
            <PasswordStrength password={password} />
            {error ? <p style={{ color: "var(--danger)", fontSize: 14 }}>{error}</p> : null}
            <SubmitButton loading={loading}>Reset Password</SubmitButton>
          </form>
        )}
      </AuthCard>
    </AuthShell>
  );
}
