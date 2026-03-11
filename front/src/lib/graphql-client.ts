const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

interface GraphQLRequestOptions {
  actorId?: string;
  actorRole?: "hr" | "employee";
}

export async function graphql<T>(
  query: string,
  variables?: Record<string, unknown>,
  options?: GraphQLRequestOptions,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options?.actorId) {
    headers["x-actor-id"] = options.actorId;
  }
  if (options?.actorRole) {
    headers["x-actor-role"] = options.actorRole;
  }

  const response = await fetch(`${API_URL}/graphql`, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  const json: GraphQLResponse<T> = await response.json();

  if (json.errors) {
    throw new Error(json.errors.map((e) => e.message).join(", "));
  }

  if (!json.data) {
    throw new Error("No data returned from GraphQL");
  }

  return json.data;
}

export function getDocumentPreviewUrl(documentId: string): string {
  return `${API_URL}/documents/${documentId}`;
}
