"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthCard, AuthInput, AuthShell, ForgotSuccess, SubmitButton, authIcons } from "@/components/auth-ui";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  return (
    <AuthShell>
      <AuthCard title="Forgot Password?" subtitle="No worries. We will send you a reset link.">
        {sent ? (
          <ForgotSuccess />
        ) : (
          <form className="stack-lg">
            <AuthInput icon={authIcons.Mail} label="Email Address" type="email" placeholder="aman@example.com" />
            <SubmitButton onClick={() => setSent(true)}>Send Reset Link</SubmitButton>
            <Link className="btn btn-outline" href="/login">Back to Login</Link>
          </form>
        )}
      </AuthCard>
    </AuthShell>
  );
}
