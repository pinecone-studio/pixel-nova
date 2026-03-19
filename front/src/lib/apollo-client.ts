import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://backend.pixel-nova.workers.dev"
).replace(/\/$/, "");
export const HR_ACTOR_ID = "hr-shared-actor";

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
    uri: `${API_URL}/graphql`,
    fetchOptions: {
      cache: "no-store",
    },
  }),
  cache: new InMemoryCache(),
});
