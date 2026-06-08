import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CMS — Call Management System",
  description: "Production call management dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
