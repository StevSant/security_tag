"use client";

import { AuthProvider } from "@/shared/infrastructure/auth";

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

