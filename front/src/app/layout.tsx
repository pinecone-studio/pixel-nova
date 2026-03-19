import type { Metadata } from "next";

import { FooterSection } from "@/components/footerSection";
import { Navbar } from "@/components/navbarSection";
import { ApolloAppProvider } from "@/lib/apollo-provider";

import "./globals.css";

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
    <html lang="mn" className="font-sans">
      <body>
        <ApolloAppProvider>
          <div className="min-h-screen bg-[#F5F7FB] flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <FooterSection />
          </div>
        </ApolloAppProvider>
      </body>
    </html>
  );
}
