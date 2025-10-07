// src/app/layout.tsx
import type { Metadata } from "next";
import Providers from "./providers";
import "./globals.css";

export const metadata: Metadata = { title: "Funeral CRM" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <head></head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
