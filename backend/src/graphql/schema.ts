import { createSchema } from "graphql-yoga";

import type { DbClient } from "../db/client";
import {
  createTriggeredActionRecords,
  getAuditLogs,
  getDocuments,
  listActionConfigs,
  type RequestContext,
  upsertActionConfig,
} from "../db/queries";

export interface GraphQLContext extends RequestContext {
  env: CloudflareBindings;
  db: DbClient;
}

const typeDefs = /* GraphQL */ `
  type Employee {
    id: ID!
    employeeCode: String!
    firstName: String!
    lastName: String!
    department: String!
    branch: String!
    level: String!
    hireDate: String!
    terminationDate: String
    status: String!
  }

  type Document {
    id: ID!
    employeeId: ID!
    action: String!
    documentName: String!
    storageUrl: String!
    createdAt: String!
  }

  type AuditLog {
    id: ID!
    employeeId: ID!
    action: String!
    documentsGenerated: Boolean!
    recipientsNotified: Boolean!
    timestamp: String!
  }

  type Recipient {
    id: ID!
    role: String!
    email: String!
  }

  type ActionConfig {
    id: ID!
    name: String!
    phase: String!
    triggerFields: [String!]!
  }

  type TriggerActionResult {
    employee: Employee!
    document: Document!
    auditLog: AuditLog!
  }

  input UpdateActionRegistryInput {
    name: String!
    phase: String!
    triggerFields: [String!]!
  }

  type Query {
    documents(employeeId: ID!): [Document!]!
    auditLogs(employeeId: ID): [AuditLog!]!
    actions: [ActionConfig!]!
  }

  type Mutation {
    triggerAction(employeeId: ID!, action: String!): TriggerActionResult!
    updateRegistry(input: UpdateActionRegistryInput!): ActionConfig!
  }
`;

const resolvers = {
  Query: {
    documents: async (
      _: unknown,
      args: { employeeId: string },
      context: GraphQLContext,
    ) => getDocuments(context.db, args.employeeId),
    auditLogs: async (
      _: unknown,
      args: { employeeId?: string | null },
      context: GraphQLContext,
    ) => getAuditLogs(context.db, args.employeeId),
    actions: async (_: unknown, __: unknown, context: GraphQLContext) =>
      listActionConfigs(context.db),
  },
  Mutation: {
    triggerAction: async (
      _: unknown,
      args: { employeeId: string; action: string },
      context: GraphQLContext,
    ) => {
      const result = await createTriggeredActionRecords(
        context.db,
        args.employeeId,
        args.action,
      );

      return {
        employee: result.employee,
        document: result.document,
        auditLog: result.auditEntry,
      };
    },
    updateRegistry: async (
      _: unknown,
      args: { input: { name: string; phase: string; triggerFields: string[] } },
      context: GraphQLContext,
    ) => upsertActionConfig(context.db, args.input),
  },
};

export const graphqlSchema = createSchema<GraphQLContext>({
  typeDefs,
  resolvers,
});
