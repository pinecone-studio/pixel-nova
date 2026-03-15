"use client";

import { ApolloProvider } from "@apollo/client/react";

import { appApolloClient } from "./apollo-client";

export function ApolloAppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ApolloProvider client={appApolloClient}>{children}</ApolloProvider>;
}
