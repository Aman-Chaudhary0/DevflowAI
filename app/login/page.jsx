"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthCard, AuthDivider, AuthInput, AuthShell, SocialButtons, SubmitButton, authIcons } from "@/components/auth-ui";
import { api } from "@/lib/api";

// LoginPage is a page component that renders the login form, allowing users to sign in with their email and password. It includes options for remembering the user, resetting the password, and signing in with social accounts. The component manages the loading state during the login process.
export default function LoginPage() {
  const router = useRouter();
  const [invite, setInvite] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const token = params.get("invite") || "";
    if (/^[a-fA-F0-9]{64}$/.test(token)) setInvite(token);
    if (token) window.history.replaceState({}, "", `${window.location.pathname}${window.location.search}`);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.login({ email, password });
      router.replace(invite ? `/dashboard/team/members#invite=${encodeURIComponent(invite)}` : "/dashboard");
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
          <Link href={invite ? `/register#invite=${encodeURIComponent(invite)}` : "/register"} style={{ color: "var(--primary)", fontWeight: 800, marginLeft: 6 }}>Register</Link>
        </p>
      </AuthCard>
    </AuthShell>
  );
}
