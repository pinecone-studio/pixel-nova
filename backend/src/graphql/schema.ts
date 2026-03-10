import { GraphQLScalarType, Kind, type ValueNode } from "graphql";
import { createSchema } from "graphql-yoga";

import type { DbClient } from "../db/client";
import {
  createTriggeredActionRecords,
  ensureDefaultActionConfigs,
  getEmployeeById,
  getAuditLogs,
  getDocuments,
  listActionConfigs,
  type RequestContext,
  upsertActionConfig,
} from "../db/queries";
import { resolveEmployeeLifecycleAction } from "../services/actionResolver";

export interface GraphQLContext extends RequestContext {
  env: CloudflareBindings;
  db: DbClient;
}

const typeDefs = /* GraphQL */ `
  scalar JSON

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

  type ResolvedEmployeeAction {
    action: String!
  }

  input UpdateActionRegistryInput {
    name: String!
    phase: String!
    triggerFields: [String!]!
  }

  input ResolveEmployeeActionInput {
    employeeId: ID!
    changedFields: [String!]!
    oldValues: JSON!
    newValues: JSON!
  }

  type Query {
    documents(employeeId: ID!): [Document!]!
    auditLogs(employeeId: ID): [AuditLog!]!
    actions: [ActionConfig!]!
  }

  type Mutation {
    triggerAction(employeeId: ID!, action: String!): TriggerActionResult!
    resolveEmployeeAction(input: ResolveEmployeeActionInput!): ResolvedEmployeeAction
    updateRegistry(input: UpdateActionRegistryInput!): ActionConfig!
  }
`;

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

function parseJsonLiteral(valueNode: ValueNode): JsonValue {
  switch (valueNode.kind) {
    case Kind.STRING:
    case Kind.BOOLEAN:
      return valueNode.value;
    case Kind.INT:
    case Kind.FLOAT:
      return Number(valueNode.value);
    case Kind.NULL:
      return null;
    case Kind.OBJECT:
      return Object.fromEntries(
        valueNode.fields.map((field) => [
          field.name.value,
          parseJsonLiteral(field.value),
        ]),
      );
    case Kind.LIST:
      return valueNode.values.map((item) => parseJsonLiteral(item));
    default:
      return null;
  }
}

const jsonScalar = new GraphQLScalarType({
  name: "JSON",
  serialize: (value) => value,
  parseValue: (value) => value,
  parseLiteral: (valueNode) => parseJsonLiteral(valueNode),
});

const resolvers = {
  JSON: jsonScalar,
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
    resolveEmployeeAction: async (
      _: unknown,
      args: {
        input: {
          employeeId: string;
          changedFields: string[];
          oldValues: Record<string, unknown>;
          newValues: Record<string, unknown>;
        };
      },
      context: GraphQLContext,
    ) => {
      const employee = await getEmployeeById(context.db, args.input.employeeId);

      if (!employee) {
        throw new Error(`Employee not found for id ${args.input.employeeId}`);
      }

      await ensureDefaultActionConfigs(context.db);
      const actionConfigs = await listActionConfigs(context.db);
      const action = resolveEmployeeLifecycleAction(args.input, { actionConfigs });

      return action ? { action } : null;
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
