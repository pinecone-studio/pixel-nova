export const typeDefs = /* GraphQL */ `
  scalar JSON

  type Employee {
    id: ID!
    employeeCode: String!
    firstName: String!
    lastName: String!
    firstNameEng: String
    lastNameEng: String
    entraId: String
    email: String
    imageUrl: String
    github: String
    department: String!
    branch: String!
    level: String!
    hireDate: String!
    terminationDate: String
    status: String!
    numberOfVacationDays: Int
    isSalaryCompany: Boolean
    isKpi: Boolean
    birthDayAndMonth: String
    birthdayPoster: String
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
    documents: [Document!]!
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
    firstNameEng: String
    lastNameEng: String
    entraId: String
    email: String
    imageUrl: String
    github: String
    department: String!
    branch: String!
    level: String!
    hireDate: String!
    terminationDate: String
    status: String!
    numberOfVacationDays: Int
    isSalaryCompany: Boolean
    isKpi: Boolean
    birthDayAndMonth: String
    birthdayPoster: String
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

  type DocumentContent {
    id: ID!
    documentName: String!
    contentType: String!
    content: String!
  }

  type Query {
    documents(employeeId: ID!): [Document!]!
    auditLogs(employeeId: ID): [AuditLog!]!
    actions: [ActionConfig!]!
    documentContent(documentId: ID!): DocumentContent
  }

  type Mutation {
    triggerAction(employeeId: ID!, action: String!): TriggerActionResult!
    upsertEmployee(input: UpsertEmployeeInput!): UpsertEmployeeResult!
    resolveEmployeeAction(input: ResolveEmployeeActionInput!): ResolvedEmployeeAction
    updateRegistry(input: UpdateActionRegistryInput!): ActionConfig!
  }
`;
