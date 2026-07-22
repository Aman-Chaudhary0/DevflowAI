"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { AuthCard, AuthInput, AuthShell, PasswordStrength, SubmitButton, authIcons } from "@/components/auth-ui";

// ResetPasswordPage is a page component that renders the "Reset Password" form, allowing users to create a new password after receiving a secure reset token. It includes input fields for the new password and confirmation, along with a password strength indicator. Upon successful password reset, it displays a success message and provides a link to continue to the login page.
export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);

  return (
    <AuthShell>
      <AuthCard title="Create New Password" subtitle="Choose a strong password for your secure reset token.">
        {success ? (
          <div className="stack-lg center" style={{ textAlign: "center" }}>
            <div className="verify-illustration success"><CheckCircle2 size={64} /></div>
            <h3 className="h3">Password Changed Successfully</h3>
            <p className="muted">Redirecting to Login.</p>
            <Link className="btn btn-primary auth-submit" href="/login">Continue to Login</Link>
          </div>
        ) : (
          <form className="stack-lg">
            <AuthInput icon={authIcons.Lock} label="New Password" value={password} onChange={(event) => setPassword(event.target.value)} withPasswordToggle />
            <AuthInput icon={authIcons.KeyRound} label="Confirm Password" withPasswordToggle />
            <PasswordStrength password={password} />
            <SubmitButton onClick={() => setSuccess(true)}>Reset Password</SubmitButton>
          </form>
        )}
      </AuthCard>
    </AuthShell>
  );
}
