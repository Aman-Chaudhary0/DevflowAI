import { AuthCard, AuthShell, VerifyPanel } from "@/components/auth-ui";

export default function VerifyEmailPage() {
  return (
    <AuthShell>
      <AuthCard title="Verify Your Email" subtitle="Confirm your email ownership to protect your workspace.">
        <VerifyPanel />
      </AuthCard>
    </AuthShell>
  );
}
