import { GraphQLScalarType, Kind, type ValueNode } from "graphql";
import { createSchema } from "graphql-yoga";

import type { DbClient } from "../db/client";
import {
  createTriggeredActionRecords,
  getEmployeeById,
  getAuditLogs,
  getDocuments,
  listActionConfigs,
  type RequestContext,
  updateAuditLogNotified,
  upsertEmployeeRecord,
  upsertActionConfig,
} from "../db/queries";
import { dispatchNotification } from "../notifications/dispatchNotification";
import {
  buildEmployeeChangeSet,
  resolveEmployeeLifecycleAction,
} from "../services/actionResolver";

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

  type UpsertEmployeeResult {
    employee: Employee!
    resolvedAction: String
    triggeredActionResult: TriggerActionResult
  }

  type ResolvedEmployeeAction {
    action: String!
  }

  input UpsertEmployeeInput {
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
    upsertEmployee(input: UpsertEmployeeInput!): UpsertEmployeeResult!
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

async function executeTriggeredAction(
  context: GraphQLContext,
  employeeId: string,
  action: string,
) {
  const resendApiKey =
    (context.env as CloudflareBindings & { RESEND_API_KEY?: string }).RESEND_API_KEY ?? "";
  const result = await createTriggeredActionRecords(
    context.db,
    employeeId,
    action,
  );

  const notificationResult = await dispatchNotification({
    db: context.db,
    employee: result.employee,
    document: result.document,
    action,
    apiKey: resendApiKey,
  });

  if (notificationResult.notified) {
    await updateAuditLogNotified(context.db, result.auditEntry.id, true);
    result.auditEntry.recipientsNotified = true;
  }

  return {
    employee: result.employee,
    document: result.document,
    auditLog: result.auditEntry,
  };
}

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
    ) => executeTriggeredAction(context, args.employeeId, args.action),
    upsertEmployee: async (
      _: unknown,
      args: {
        input: {
          id: string;
          employeeCode: string;
          firstName: string;
          lastName: string;
          department: string;
          branch: string;
          level: string;
          hireDate: string;
          terminationDate?: string | null;
          status: string;
        };
      },
      context: GraphQLContext,
    ) => {
      const persisted = await upsertEmployeeRecord(context.db, {
        id: args.input.id,
        employeeCode: args.input.employeeCode,
        firstName: args.input.firstName,
        lastName: args.input.lastName,
        department: args.input.department,
        branch: args.input.branch,
        level: args.input.level,
        hireDate: args.input.hireDate,
        terminationDate: args.input.terminationDate,
        status: args.input.status,
      });

      const changeSet = buildEmployeeChangeSet(
        persisted.previousEmployee
          ? {
              employeeCode: persisted.previousEmployee.employeeCode,
              firstName: persisted.previousEmployee.firstName,
              lastName: persisted.previousEmployee.lastName,
              department: persisted.previousEmployee.department,
              branch: persisted.previousEmployee.branch,
              level: persisted.previousEmployee.level,
              hireDate: persisted.previousEmployee.hireDate,
              terminationDate: persisted.previousEmployee.terminationDate,
              status: persisted.previousEmployee.status,
            }
          : null,
        {
          employeeCode: persisted.employee.employeeCode,
          firstName: persisted.employee.firstName,
          lastName: persisted.employee.lastName,
          department: persisted.employee.department,
          branch: persisted.employee.branch,
          level: persisted.employee.level,
          hireDate: persisted.employee.hireDate,
          terminationDate: persisted.employee.terminationDate,
          status: persisted.employee.status,
        },
      );

      const actionConfigs = await listActionConfigs(context.db);
      const resolvedAction = resolveEmployeeLifecycleAction(
        {
          employeeId: persisted.employee.id,
          changedFields: changeSet.changedFields,
          oldValues: changeSet.oldValues,
          newValues: changeSet.newValues,
        },
        { actionConfigs },
      );

      const triggeredActionResult = resolvedAction
        ? await executeTriggeredAction(context, persisted.employee.id, resolvedAction)
        : null;

      return {
        employee: persisted.employee,
        resolvedAction,
        triggeredActionResult,
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
