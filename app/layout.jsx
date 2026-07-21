import "./globals.css";
import { SiteShell } from "@/components/site-shell";

export const metadata = {
  title: "Devflow AI",
  description: "Dark-first AI developer workspace UI built with Next.js."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>
        <div className="app-shell grid-bg">
          <SiteShell>{children}</SiteShell>
        </div>
      </body>
    </html>
  );
}
