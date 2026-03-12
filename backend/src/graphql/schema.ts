import { createSchema } from "graphql-yoga";

import type { DbClient } from "../db/client";
import type { Employee } from "../db/schema";
import type { RequestContext } from "../db/queries";
import { resolvers } from "./resolvers";
import { typeDefs } from "./typeDefs";

export interface GraphQLContext extends RequestContext {
  env: CloudflareBindings;
  db: DbClient;
  publicOrigin: string | null;
  currentEmployee: Employee | null;
  sessionToken: string | null;
}

export const graphqlSchema = createSchema<GraphQLContext>({
  typeDefs,
  resolvers,
});
