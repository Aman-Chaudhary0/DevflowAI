import { AuthCard, AuthShell, VerifyPanel } from "@/components/auth-ui";

// VerifyEmailPage is a page component that renders the "Verify Email" page, prompting users to confirm their email ownership to protect their workspace. It includes a verification panel that guides users through the email verification process.
export default function VerifyEmailPage() {
  return (
    <AuthShell>
      <AuthCard title="Verify Your Email" subtitle="Confirm your email ownership to protect your workspace.">
        <VerifyPanel />
      </AuthCard>
    </AuthShell>
  );
}
