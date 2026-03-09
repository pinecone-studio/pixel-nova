import { createYoga } from "graphql-yoga";
import { Hono } from "hono";

import { getDb } from "./db/client";
import type { ActorRole } from "./db/queries";
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

export default app;
