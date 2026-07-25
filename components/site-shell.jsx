"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

const authRoutes = ["/login", "/register", "/verify-email", "/forgot-password", "/reset-password", "/2fa"];

// SiteShell is a component that wraps the main content of the website, rendering the Navbar and Footer components for non-authentication routes, while rendering only the main content for authentication routes. It uses the usePathname hook to determine the current route and conditionally render the appropriate layout.
export function SiteShell({ children }) {
  const pathname = usePathname();
  const isAuthRoute = authRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (isAuthRoute) {
    return <main>{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
