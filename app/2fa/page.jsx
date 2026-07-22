import Link from "next/link";
import { AuthCard, AuthShell, OtpInput } from "@/components/auth-ui";

// TwoFactorPage is a page component that renders the two-factor authentication form, allowing users to enter a 6-digit code from their authenticator app, with options to use a backup code or resend the code.
export default function TwoFactorPage() {
  return (
    <AuthShell>
      <AuthCard title="Two-Factor Authentication" subtitle="Enter the 6-digit code from your authenticator app.">
        <OtpInput />
        <div className="grid grid-2">
          <button className="btn btn-outline" type="button">Use Backup Code</button>
          <button className="btn btn-outline" type="button">Resend Code</button>
        </div>
        <p className="center muted">Changed your mind? <Link href="/login" style={{ color: "var(--primary)", fontWeight: 800, marginLeft: 6 }}>Back to Login</Link></p>
      </AuthCard>
    </AuthShell>
  );
}
