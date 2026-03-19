"use client";

import { ApolloProvider } from "@apollo/client/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { appApolloClient } from "./apollo-client";

export function ApolloAppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const authSignatureRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const nextSignature = [
      window.localStorage.getItem("epas_auth_token") ?? "",
      window.localStorage.getItem("hr_authenticated") ?? "",
    ].join("|");

    if (authSignatureRef.current === null) {
      authSignatureRef.current = nextSignature;
      return;
    }

    if (authSignatureRef.current !== nextSignature) {
      authSignatureRef.current = nextSignature;
      void appApolloClient.clearStore();
    }
  }, [pathname]);

  return <ApolloProvider client={appApolloClient}>{children}</ApolloProvider>;
}
