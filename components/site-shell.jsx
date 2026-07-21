"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

const authRoutes = ["/login", "/register", "/verify-email", "/forgot-password", "/reset-password", "/2fa"];

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
