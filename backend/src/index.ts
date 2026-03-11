import { createYoga } from "graphql-yoga";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { getDb } from "./db/client";
import type { ActorRole } from "./db/queries";
import { getDocumentById } from "./db/queries";
import { graphqlSchema, type GraphQLContext } from "./graphql/schema";

const app = new Hono<{ Bindings: CloudflareBindings }>();
type YogaServerContext = { env: CloudflareBindings };

app.use(
  "*",
  cors({
    origin: ["http://localhost:3000"],
    allowHeaders: ["Content-Type", "x-actor-id", "x-actor-role"],
    allowMethods: ["GET", "POST", "OPTIONS"],
  }),
);

function normalizeRole(value: string | null): ActorRole {
  if (value === "admin" || value === "hr" || value === "employee") {
    return value;
  }

  return "unknown";
}

function parseDataUrl(dataUrl: string) {
  const [header, payload = ""] = dataUrl.split(",", 2);
  const contentType = header.slice(5).split(";")[0] || "text/plain";
  const isBase64 = header.includes(";base64");

  if (isBase64) {
    return {
      contentType,
      bytes: Uint8Array.from(Buffer.from(payload, "base64")),
      text: null,
    };
  }

  return {
    contentType,
    bytes: null,
    text: decodeURIComponent(payload),
  };
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
    publicOrigin: new URL(request.url).origin,
  }),
});

app.get("/health", (c) =>
  c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  }),
);

app.all("/graphql", async (c) => yoga.fetch(c.req.raw, { env: c.env }));

app.get("/documents/:documentId", async (c) => {
  const db = getDb(c.env);
  const documentId = c.req.param("documentId");
  const doc = await getDocumentById(db, documentId);

  if (!doc) {
    return c.json({ error: "Document not found" }, 404);
  }

  const bucket = (c.env as CloudflareBindings & { epas_documents?: R2Bucket }).epas_documents;

  if (doc.storageUrl.startsWith("r2://") && bucket) {
    const r2Key = doc.storageUrl.replace("r2://", "");
    const r2Object = await bucket.get(r2Key);
    if (r2Object) {
      const contentType = r2Object.httpMetadata?.contentType ?? "application/pdf";
      const body = await r2Object.arrayBuffer();
      c.header("Content-Type", contentType);
      c.header("Content-Disposition", `inline; filename="${doc.documentName}"`);
      return c.body(body);
    }
  }

  if (doc.storageUrl.startsWith("data:")) {
    const parsed = parseDataUrl(doc.storageUrl);
    c.header("Content-Type", parsed.contentType);
    c.header("Content-Disposition", `inline; filename="${doc.documentName}"`);

    if (parsed.bytes) {
      return c.body(parsed.bytes);
    }

    return parsed.contentType === "text/html"
      ? c.html(parsed.text ?? "")
      : c.text(parsed.text ?? "");
  }

  return c.json({ error: "Document content unavailable" }, 404);
});

export default app;
