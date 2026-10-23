"use client";

import { Suspense } from "react";
import ResetPasswordPage from "../[token]/page";

export default function DemoResetPasswordPage() {
  return (
    <Suspense fallback={<div className="grid place-items-center min-h-screen">Loading...</div>}>
      <ResetPasswordPage />
    </Suspense>
  );
}
