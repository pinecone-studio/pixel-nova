import type { Metadata } from "next";
import "./globals.css";
import LayoutShell from "./hr/layoutShell";

export const metadata: Metadata = {
  title: "EPAS - Employee Paperwork Automation System",
  description: "Employee paperwork automation system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mn">
      <body>
        <div className="min-h-screen bg-[#0A0A0F]">
          <LayoutShell>{children}</LayoutShell>
        </div>
      </body>
    </html>
  );
}
