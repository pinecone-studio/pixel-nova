import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "./components/navbarSection";
import { FooterSection } from "./components/footerSection";

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
          <Navbar />
          {children}
          <FooterSection/>
        </div>
      </body>
    </html>
  );
}
