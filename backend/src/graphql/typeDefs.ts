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
    jobTitle: String!
    level: String!
    hireDate: String!
    terminationDate: String
    status: String!
    numberOfVacationDays: Int
    isSalaryCompany: Boolean
    isKpi: Boolean
    birthDayAndMonth: String
    birthdayPoster: String
    documentProfile: JSON
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
    triggerCondition: String
    triggerFields: [String!]!
    requiredEmployeeFields: [String!]!
    recipients: [String!]!
    documents: [ActionDocumentConfig!]!
  }

  type ActionDocumentConfig {
    id: String!
    template: String!
    order: Int!
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
    jobTitle: String
    level: String!
    hireDate: String!
    terminationDate: String
    status: String!
    numberOfVacationDays: Int
    isSalaryCompany: Boolean
    isKpi: Boolean
    birthDayAndMonth: String
    birthdayPoster: String
    documentProfile: JSON
  }

  input UpdateActionRegistryInput {
    name: String!
    phase: String!
    triggerCondition: String
    triggerFields: [String!]!
    requiredEmployeeFields: [String!]
    recipients: [String!]
    documents: [UpdateActionRegistryDocumentInput!]
  }

  input UpdateActionRegistryDocumentInput {
    id: String!
    template: String!
    order: Int!
  }

  input ResolveEmployeeActionInput {
    employeeId: ID!
    changedFields: [String!]!
    oldValues: JSON!
    newValues: JSON!
  }

  input UploadHrDocumentInput {
    employeeId: ID!
    action: String!
    documentName: String!
    contentType: String!
    contentBase64: String!
  }

  type DocumentContent {
    id: ID!
    documentName: String!
    contentType: String!
    content: String!
  }

  type LeaveRequest {
    id: ID!
    employeeId: ID!
    employee: Employee!
    type: String!
    startTime: String!
    endTime: String!
    reason: String!
    status: String!
    note: String
    createdAt: String!
    updatedAt: String!
  }

  type ContractRequest {
    id: ID!
    employeeId: ID!
    employee: Employee!
    templateIds: [String!]!
    status: String!
    note: String
    signatureMode: String!
    createdAt: String!
    updatedAt: String!
    decidedAt: String
  }

  type EmployeeSignatureStatus {
    hasSignature: Boolean!
    hasPasscode: Boolean!
    updatedAt: String
  }

  type Query {
    me: Employee
    employees(search: String, status: String, department: String): [Employee!]!
    documents(employeeId: ID!): [Document!]!
    auditLogs(employeeId: ID, action: String, fromDate: String, toDate: String): [AuditLog!]!
    actions: [ActionConfig!]!
    documentContent(documentId: ID!): DocumentContent
    leaveRequests(status: String): [LeaveRequest!]!
    myLeaveRequests: [LeaveRequest!]!
    contractRequests(status: String): [ContractRequest!]!
    myContractRequests: [ContractRequest!]!
    mySignatureStatus: EmployeeSignatureStatus!
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
    submitLeaveRequest(type: String!, startTime: String!, endTime: String!, reason: String!): LeaveRequest!
    approveLeaveRequest(id: ID!, note: String): LeaveRequest!
    rejectLeaveRequest(id: ID!, note: String): LeaveRequest!
    updateMyDocumentProfile(input: JSON!): Employee!
    submitContractRequest(
      templateIds: [String!]!
      signatureMode: String
      passcode: String
      signatureData: String
    ): ContractRequest!
    approveContractRequest(id: ID!, note: String): ContractRequest!
    rejectContractRequest(id: ID!, note: String): ContractRequest!
    uploadHrDocument(input: UploadHrDocumentInput!): Document!
  }
`;
