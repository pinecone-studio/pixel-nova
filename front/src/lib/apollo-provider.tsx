"use client";

import { ApolloProvider } from "@apollo/client/react";
import { useEffect, useRef } from "react";

import { AUTH_STATE_CHANGED_EVENT } from "./auth-events";
import { appApolloClient } from "./apollo-client";

export function ApolloAppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const authSignatureRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const getSignature = () =>
      [
        window.localStorage.getItem("epas_auth_token") ?? "",
        window.localStorage.getItem("hr_authenticated") ?? "",
      ].join("|");

    authSignatureRef.current = getSignature();

    const handleAuthStateChanged = () => {
      const nextSignature = getSignature();
      if (authSignatureRef.current === nextSignature) {
        return;
      }
      authSignatureRef.current = nextSignature;
      void appApolloClient.clearStore();
    };

    const handleStorage = () => {
      handleAuthStateChanged();
    };

    window.addEventListener(AUTH_STATE_CHANGED_EVENT, handleAuthStateChanged);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(
        AUTH_STATE_CHANGED_EVENT,
        handleAuthStateChanged,
      );
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return <ApolloProvider client={appApolloClient}>{children}</ApolloProvider>;
}
