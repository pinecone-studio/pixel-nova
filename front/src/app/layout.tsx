import type { Metadata } from "next";
import { Manrope } from "next/font/google";

import { FooterSection } from "@/components/footerSection";
import { Navbar } from "@/components/navbarSection";
import { ApolloAppProvider } from "@/lib/apollo-provider";
import { cn } from "@/lib/utils";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EPAS - Ажилтны баримт бичгийн автоматжуулалтын систем",
  description: "Ажилтны баримт бичгийн автоматжуулалтын систем",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mn" className={cn("font-sans", manrope.variable)}>
      <body>
        <ApolloAppProvider>
          <div className="min-h-screen bg-[#0A0A0F]">
            <Navbar />
            {children}
            <FooterSection />
          </div>
        </ApolloAppProvider>
      </body>
    </html>
  );
}
