"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

const authRoutes = ["/login", "/register", "/verify-email", "/forgot-password", "/reset-password", "/2fa"];
const noShellRoutes = ["/dashboard"];

export function SiteShell({ children }) {
  const pathname = usePathname();
  const isAuthRoute = authRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  const isDashboard = noShellRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (isAuthRoute || isDashboard) {
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
