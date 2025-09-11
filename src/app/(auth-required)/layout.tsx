import { ProtectedLayout } from "@/components/layout";

export default function AuthRequiredLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedLayout requireOnboarding={false}>{children}</ProtectedLayout>
  );
}
