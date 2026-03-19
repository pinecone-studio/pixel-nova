import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

const DEFAULT_REMOTE_API_URL = "https://backend.pixel-nova.workers.dev";
export const HR_ACTOR_ID = "hr-shared-actor";

export function resolveApiUrl() {
  const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (configuredApiUrl) {
    return configuredApiUrl.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    const { hostname, protocol } = window.location;
    const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1";

    if (isLocalHost) {
      return `${protocol}//${hostname}:8787`;
    }
  }

  return DEFAULT_REMOTE_API_URL;
}

export const API_URL = resolveApiUrl();

export interface GraphQLRequestOptions {
  actorId?: string;
  actorRole?: "hr" | "employee";
  authToken?: string;
}

export function buildGraphQLHeaders(options?: GraphQLRequestOptions) {
  const headers: Record<string, string> = {};
  const actorId =
    options?.actorId ?? (options?.actorRole === "hr" ? HR_ACTOR_ID : undefined);

  if (actorId) {
    headers["x-actor-id"] = actorId;
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
    uri: () => `${resolveApiUrl()}/graphql`,
    fetchOptions: {
      cache: "no-store",
    },
  }),
  cache: new InMemoryCache(),
});
