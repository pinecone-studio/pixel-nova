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
    phase: String!
    actorId: String
    actorRole: String!
    documentIds: [ID!]!
    recipientRoles: [String!]!
    recipientEmails: [String!]!
    incompleteFields: [String!]!
    documentsGenerated: Boolean!
    notificationAttempted: Boolean!
    recipientsNotified: Boolean!
    notificationError: String
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
    incompleteFields: [String!]!
  }

  type UpsertEmployeeResult {
    employee: Employee!
    resolvedAction: String
    triggeredActionResult: TriggerActionResult
  }

  type ResolvedEmployeeAction {
    action: String!
  }

  type AuthSession {
    token: String!
    expiresAt: String!
    employee: Employee!
  }

  type RequestOtpResult {
    success: Boolean!
    maskedEmail: String!
    expiresAt: String!
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
    me: Employee
    documents(employeeId: ID!): [Document!]!
    auditLogs(employeeId: ID, action: String, fromDate: String, toDate: String): [AuditLog!]!
    actions: [ActionConfig!]!
    documentContent(documentId: ID!): DocumentContent
  }

  type Mutation {
    requestOtp(employeeCode: String!): RequestOtpResult!
    verifyOtp(employeeCode: String!, code: String!): AuthSession!
    loginWithCode(employeeCode: String!): AuthSession!
    logout: Boolean!
    triggerAction(employeeId: ID!, action: String!, dryRun: Boolean, overrideRecipients: [String!]): TriggerActionResult!
    upsertEmployee(input: UpsertEmployeeInput!): UpsertEmployeeResult!
    resolveEmployeeAction(input: ResolveEmployeeActionInput!): ResolvedEmployeeAction
    updateRegistry(input: UpdateActionRegistryInput!): ActionConfig!
  }
`;
