import "./globals.css";
import { SiteShell } from "@/components/site-shell";

// metadata is an object that defines the metadata for the application, including the title and description. This metadata is used for SEO purposes and provides information about the application to search engines and social media platforms.
export const metadata = {
  title: "Devflow AI",
  description: "Dark-first AI developer workspace UI built with Next.js."
};

// RootLayout is a layout component that wraps the entire application, providing a consistent structure and styling. It includes the HTML and body elements, sets the language and theme, and renders the SiteShell component, which contains the main content of the application.
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
