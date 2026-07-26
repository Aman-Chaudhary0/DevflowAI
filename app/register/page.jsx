"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AuthCard,
  AuthDivider,
  AuthInput,
  AuthShell,
  PasswordStrength,
  RegisterValidation,
  SocialButtons,
  SubmitButton,
  authIcons
} from "@/components/auth-ui";
import { api } from "@/lib/api";

// RegisterPage is a page component that renders the registration form, allowing users to create a new account by providing their full name, username, email address, and password. It includes validation for the username and password strength, as well as options to agree to terms and privacy policy. The component manages the state of the input fields and handles form submission.
export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Full name is required.");
    if (username.length < 4) return setError("Username must be at least 4 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    if (!agreed) return setError("You must agree to the Terms and Privacy Policy.");

    setLoading(true);
    try {
      await api.register({ name, email, password, confirmPassword });
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <AuthCard title="Create Your Workspace" subtitle="Join thousands of developers using AI.">
        <form className="stack-lg" onSubmit={handleSubmit}>
          <AuthInput
            icon={authIcons.UserRound}
            label="Full Name"
            placeholder="Aman Chaudhary"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <AuthInput
            icon={authIcons.User}
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            validation={{
              ok: username.length >= 4,
              text: username.length >= 4 ? "Username available" : "Use at least 4 characters"
            }}
          />
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
          />
          <AuthInput
            icon={authIcons.KeyRound}
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            withPasswordToggle
          />
          <PasswordStrength password={password} />
          <RegisterValidation email={email} password={password} username={username} />
          <label className="row" style={{ gap: 8 }}>
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            I agree to the{" "}
            <Link href="/terms" style={{ color: "var(--primary)" }}>Terms</Link>
            {" "}and{" "}
            <Link href="/privacy" style={{ color: "var(--primary)" }}>Privacy Policy</Link>.
          </label>
          {error ? <p style={{ color: "var(--danger)", fontSize: 14 }}>{error}</p> : null}
          <SubmitButton loading={loading}>Create Account</SubmitButton>
        </form>
        <AuthDivider />
        <SocialButtons />
        <p className="center muted">
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--primary)", fontWeight: 800, marginLeft: 6 }}>Login</Link>
        </p>
      </AuthCard>
    </AuthShell>
  );
}
