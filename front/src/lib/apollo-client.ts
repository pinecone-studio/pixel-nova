import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787"
).replace(/\/$/, "");

export interface GraphQLRequestOptions {
  actorId?: string;
  actorRole?: "hr" | "employee";
  authToken?: string;
}

export function buildGraphQLHeaders(options?: GraphQLRequestOptions) {
  const headers: Record<string, string> = {};

  if (options?.actorId) {
    headers["x-actor-id"] = options.actorId;
  }
  if (options?.actorRole) {
    headers["x-actor-role"] = options.actorRole;
  }
  if (options?.authToken) {
    headers.Authorization = `Bearer ${options.authToken}`;
  }

  return headers;
}

export const appApolloClient = new ApolloClient({
  link: new HttpLink({
    uri: `${API_URL}/graphql`,
    fetchOptions: {
      cache: "no-store",
    },
  }),
  cache: new InMemoryCache(),
});
