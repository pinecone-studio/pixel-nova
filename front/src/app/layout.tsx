import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbarSection";
import { FooterSection } from "@/components/footerSection";
import { ApolloAppProvider } from "@/lib/apollo-provider";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="mn" className={cn("font-sans", geist.variable)}>
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
