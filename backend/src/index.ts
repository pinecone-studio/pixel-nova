import { createYoga } from "graphql-yoga";
import { Hono } from "hono";

import { getDb } from "./db/client";
import type { ActorRole } from "./db/queries";
import { getDocumentById } from "./db/queries";
import { graphqlSchema, type GraphQLContext } from "./graphql/schema";

const app = new Hono<{ Bindings: CloudflareBindings }>();
type YogaServerContext = { env: CloudflareBindings };

function normalizeRole(value: string | null): ActorRole {
  if (value === "admin" || value === "hr" || value === "employee") {
    return value;
  }

  return "unknown";
}

const yoga = createYoga<YogaServerContext, Omit<GraphQLContext, "env">>({
  schema: graphqlSchema,
  graphqlEndpoint: "/graphql",
  landingPage: false,
  context: ({ request, env }) => ({
    db: getDb(env),
    actor: {
      id: request.headers.get("x-actor-id"),
      role: normalizeRole(request.headers.get("x-actor-role")),
    },
  }),
});

app.get("/health", (c) =>
  c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  }),
);

app.all("/graphql", async (c) => yoga.fetch(c.req.raw, { env: c.env }));

// Document download/preview endpoint
app.get("/documents/:documentId", async (c) => {
  const db = getDb(c.env);
  const documentId = c.req.param("documentId");
  const doc = await getDocumentById(db, documentId);

  if (!doc) {
    return c.json({ error: "Document not found" }, 404);
  }

  const bucket = (c.env as CloudflareBindings & { epas_documents?: R2Bucket }).epas_documents;

  // R2-оос авах
  if (doc.storageUrl.startsWith("r2://") && bucket) {
    const r2Key = doc.storageUrl.replace("r2://", "");
    const r2Object = await bucket.get(r2Key);
    if (r2Object) {
      const content = await r2Object.text();
      return c.html(content);
    }
  }

  // Data URL fallback
  if (doc.storageUrl.startsWith("data:")) {
    const commaIdx = doc.storageUrl.indexOf(",");
    const content = decodeURIComponent(doc.storageUrl.slice(commaIdx + 1));
    if (doc.storageUrl.includes("text/html")) {
      return c.html(content);
    }
    return c.text(content);
  }

  return c.json({ error: "Document content unavailable" }, 404);
});

export default app;
