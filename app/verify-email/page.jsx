"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CheckCircle2, Mail, RefreshCw } from "lucide-react";
import { AuthCard, AuthShell } from "@/components/auth-ui";
import { api } from "@/lib/api";

function VerifyEmailContent() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") || "";
  const token = params.get("token") || "";

  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!token) return;
    api.verifyEmail(token)
      .then(() => setVerified(true))
      .catch((err) => setError(err.message));
  }, [token]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  async function handleResend() {
    if (!email || countdown > 0) return;
    setResendLoading(true);
    setResendMsg("");
    try {
      await api.resendVerification(email);
      setResendMsg("Verification email sent.");
      setCountdown(60);
    } catch (err) {
      setResendMsg(err.message);
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <AuthCard title="Verify Your Email" subtitle="Confirm your email ownership to protect your workspace.">
      <div className="stack-lg center" style={{ textAlign: "center" }}>
        <div className={`verify-illustration ${verified ? "success" : ""}`}>
          {verified ? <CheckCircle2 size={64} /> : <Mail size={64} />}
        </div>

        {verified ? (
          <>
            <h3 className="h3">Email Verified Successfully</h3>
            <p className="muted">You can now sign in to your workspace.</p>
            <Link className="btn btn-primary auth-submit" href="/login">Continue to Login</Link>
          </>
        ) : error ? (
          <>
            <p style={{ color: "var(--danger)" }}>{error}</p>
            <Link className="btn btn-outline" href="/login">Back to Login</Link>
          </>
        ) : token ? (
          <p className="muted">Verifying your email...</p>
        ) : (
          <>
            <p className="muted">We sent a verification link to</p>
            <strong>{email || "your email address"}</strong>
            <div className="card card-pad" style={{ width: "100%" }}>
              <span className="soft">
                {countdown > 0 ? `Resend available in ${countdown}s` : "Click below to resend"}
              </span>
            </div>
            {resendMsg ? <p style={{ color: "var(--success)", fontSize: 14 }}>{resendMsg}</p> : null}
            <div className="grid grid-2" style={{ width: "100%" }}>
              <button
                className="btn btn-outline"
                disabled={resendLoading || countdown > 0}
                onClick={handleResend}
                type="button"
              >
                <RefreshCw size={17} /> {resendLoading ? "Sending..." : "Resend Email"}
              </button>
              <button className="btn btn-outline" onClick={() => router.push("/register")} type="button">
                Change Email
              </button>
            </div>
          </>
        )}
      </div>
    </AuthCard>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthShell>
      <Suspense fallback={<AuthCard title="Verify Your Email" subtitle="Loading..."><div className="center" style={{ padding: 40 }}><span className="spinner" style={{ borderColor: "var(--border)", borderTopColor: "var(--primary)" }} /></div></AuthCard>}>
        <VerifyEmailContent />
      </Suspense>
    </AuthShell>
  );
}
