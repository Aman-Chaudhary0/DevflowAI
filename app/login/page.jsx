"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthCard, AuthDivider, AuthInput, AuthShell, SocialButtons, SubmitButton, authIcons } from "@/components/auth-ui";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.login({ email, password });
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <AuthCard title="Welcome Back" subtitle="Sign in to continue building with AI.">
        <form className="stack-lg" onSubmit={handleSubmit}>
          <AuthInput
            icon={authIcons.Mail}
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="aman@example.com"
          />
          <AuthInput
            icon={authIcons.Lock}
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            withPasswordToggle
            placeholder="Enter your password"
          />
          <div className="row between wrap" style={{ gap: 12 }}>
            <label className="row" style={{ gap: 8 }}>
              <input type="checkbox" /> Remember Me
            </label>
            <Link className="muted" href="/forgot-password">Forgot Password?</Link>
          </div>
          {error ? <p style={{ color: "var(--danger)", fontSize: 14 }}>{error}</p> : null}
          <SubmitButton loading={loading}>Login</SubmitButton>
        </form>
        <AuthDivider />
        <SocialButtons />
        <p className="center muted">
          Do not have an account?{" "}
          <Link href="/register" style={{ color: "var(--primary)", fontWeight: 800, marginLeft: 6 }}>Register</Link>
        </p>
      </AuthCard>
    </AuthShell>
  );
}
