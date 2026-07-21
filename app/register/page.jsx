"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthCard, AuthDivider, AuthInput, AuthShell, PasswordStrength, RegisterValidation, SocialButtons, SubmitButton, authIcons } from "@/components/auth-ui";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <AuthShell>
      <AuthCard title="Create Your Workspace" subtitle="Join thousands of developers using AI.">
        <form className="stack-lg">
          <AuthInput icon={authIcons.UserRound} label="Full Name" placeholder="Aman Chaudhary" />
          <AuthInput icon={authIcons.User} label="Username" value={username} onChange={(event) => setUsername(event.target.value)} validation={{ ok: username.length >= 4, text: username.length >= 4 ? "Username available" : "Use at least 4 characters" }} />
          <AuthInput icon={authIcons.Mail} label="Email Address" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="aman@example.com" />
          <AuthInput icon={authIcons.Lock} label="Password" value={password} onChange={(event) => setPassword(event.target.value)} withPasswordToggle />
          <AuthInput icon={authIcons.KeyRound} label="Confirm Password" withPasswordToggle />
          <PasswordStrength password={password} />
          <RegisterValidation email={email} password={password} username={username} />
          <label className="row" style={{ gap: 8 }}>
            <input type="checkbox" /> I agree to the <Link href="/terms" style={{ color: "var(--primary)" }}>Terms</Link> and <Link href="/privacy" style={{ color: "var(--primary)" }}>Privacy Policy</Link>.
          </label>
          <SubmitButton>Create Account</SubmitButton>
        </form>
        <AuthDivider />
        <SocialButtons />
        <p className="center muted">Already have an account? <Link href="/login" style={{ color: "var(--primary)", fontWeight: 800, marginLeft: 6 }}>Login</Link></p>
      </AuthCard>
    </AuthShell>
  );
}
