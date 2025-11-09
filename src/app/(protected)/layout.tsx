"use client";

import { ProtectedLayout } from "@/components/layout";

export default function ProtectedRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedLayout requireOnboarding={true}>{children}</ProtectedLayout>;
}
