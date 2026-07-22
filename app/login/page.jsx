"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthCard, AuthDivider, AuthInput, AuthShell, SocialButtons, SubmitButton, authIcons } from "@/components/auth-ui";

// LoginPage is a page component that renders the login form, allowing users to sign in with their email and password. It includes options for remembering the user, resetting the password, and signing in with social accounts. The component manages the loading state during the login process.
export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  return (
    <AuthShell>
      <AuthCard title="Welcome Back" subtitle="Sign in to continue building with AI.">
        <form className="stack-lg">
          <AuthInput icon={authIcons.Mail} label="Email Address" type="email" placeholder="aman@example.com" />
          <AuthInput icon={authIcons.Lock} label="Password" withPasswordToggle placeholder="Enter your password" />
          <div className="row between wrap" style={{ gap: 12 }}>
            <label className="row" style={{ gap: 8 }}>
              <input type="checkbox" /> Remember Me
            </label>
            <Link className="muted" href="/forgot-password">Forgot Password?</Link>
          </div>
          <SubmitButton loading={loading} onClick={() => setLoading(true)}>Login</SubmitButton>
        </form>
        <AuthDivider />
        <SocialButtons />
        <p className="center muted">Do not have an account? <Link href="/register" style={{ color: "var(--primary)", fontWeight: 800, marginLeft: 6 }}>Register</Link></p>
      </AuthCard>
    </AuthShell>
  );
}
