import { createYoga } from "graphql-yoga";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { getDb } from "./db/client";
import type { ActorRole } from "./db/queries";
import { getDocumentById, getSessionByToken } from "./db/queries";
import { processEmployeeLifecycleEvent } from "./events/processEmployeeLifecycleEvent";
import { graphqlSchema, type GraphQLContext } from "./graphql/schema";
import { validateDocumentAccess } from "./notifications/documentLinks";

const app = new Hono<{ Bindings: CloudflareBindings }>();
type YogaServerContext = { env: CloudflareBindings };

app.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin) return "*";
      if (
        origin.startsWith("http://localhost") ||
        origin.startsWith("https://localhost") ||
        origin.includes("pixel-nova") ||
        origin.includes("pages.dev") ||
        origin.includes("vercel.app")
      ) {
        return origin;
      }
      return "http://localhost:3000";
    },
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "x-actor-id",
      "x-actor-role",
    ],
    allowMethods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  }),
);

function normalizeRole(value: string | null): ActorRole {
  if (value === "admin" || value === "hr" || value === "employee") {
    return value;
  }

  return "unknown";
}

function extractBearerToken(header: string | null) {
  if (!header) {
    return null;
  }

  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() ?? null;
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
  context: async ({ request, env }) => {
    const db = getDb(env);
    const sessionToken = extractBearerToken(
      request.headers.get("authorization"),
    );
    const session = sessionToken
      ? await getSessionByToken(db, sessionToken)
      : null;
    const actor = session
      ? {
          id: session.employee.id,
          role: "employee" as const,
        }
      : sessionToken
        ? {
            id: null,
            role: "unknown" as const,
          }
        : {
            id: request.headers.get("x-actor-id"),
            role: normalizeRole(request.headers.get("x-actor-role")),
          };

    return {
      db,
      actor,
      currentEmployee: session?.employee ?? null,
      sessionToken,
      publicOrigin: new URL(request.url).origin,
    };
  },
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
  const signingSecret =
    (c.env as CloudflareBindings & { DOCUMENT_LINK_SECRET?: string })
      .DOCUMENT_LINK_SECRET ?? "";
  const isAuthorized = await validateDocumentAccess({
    documentId,
    expires: c.req.query("expires") ?? null,
    signature: c.req.query("signature") ?? null,
    signingSecret,
  });

  if (!isAuthorized) {
    return c.json({ error: "Invalid or expired document link" }, 403);
  }

  const doc = await getDocumentById(db, documentId);

  if (!doc) {
    return c.json({ error: "Document not found" }, 404);
  }

  const bucket = (c.env as CloudflareBindings & { epas_documents?: R2Bucket })
    .epas_documents;

  if (doc.storageUrl.startsWith("r2://") && bucket) {
    const r2Key = doc.storageUrl.replace("r2://", "");
    const r2Object = await bucket.get(r2Key);
    if (r2Object) {
      const contentType =
        r2Object.httpMetadata?.contentType ?? "application/pdf";
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

const worker = {
  fetch: app.fetch,
  queue: async (batch: MessageBatch<unknown>, env: CloudflareBindings) => {
    const db = getDb(env);

    for (const message of batch.messages) {
      try {
        await processEmployeeLifecycleEvent(
          {
            env,
            db,
            actor: { id: "queue-consumer", role: "hr" },
            publicOrigin: null,
            currentEmployee: null,
            sessionToken: null,
          },
          message.body as Parameters<typeof processEmployeeLifecycleEvent>[1],
        );
        message.ack();
      } catch (error) {
        console.error("Failed to process lifecycle event", error);
        message.retry();
      }
    }
  },
};

export default worker;
