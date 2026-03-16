import { gql } from "@apollo/client";

export const EMPLOYEE_FULL_FIELDS = gql`
  fragment EmployeeFullFields on Employee {
    id
    employeeCode
    firstName
    lastName
    firstNameEng
    lastNameEng
    entraId
    email
    imageUrl
    github
    department
    branch
    jobTitle
    level
    hireDate
    terminationDate
    status
    numberOfVacationDays
    isSalaryCompany
    isKpi
    birthDayAndMonth
    birthdayPoster
    documentProfile
  }
`;

export const EMPLOYEE_SUMMARY_FIELDS = gql`
  fragment EmployeeSummaryFields on Employee {
    id
    employeeCode
    firstName
    lastName
    department
    branch
    jobTitle
    level
    email
    status
    hireDate
  }
`;

export const DOCUMENT_FIELDS = gql`
  fragment DocumentFields on Document {
    id
    employeeId
    action
    documentName
    storageUrl
    createdAt
  }
`;

export const DOCUMENT_CONTENT_FIELDS = gql`
  fragment DocumentContentFields on DocumentContent {
    id
    documentName
    contentType
    content
  }
`;

export const AUDIT_LOG_FIELDS = gql`
  fragment AuditLogFields on AuditLog {
    id
    employeeId
    action
    phase
    actorId
    actorRole
    documentIds
    recipientRoles
    recipientEmails
    incompleteFields
    documentsGenerated
    notificationAttempted
    recipientsNotified
    notificationError
    timestamp
  }
`;

export const ACTION_CONFIG_FIELDS = gql`
  fragment ActionConfigFields on ActionConfig {
    id
    name
    phase
    triggerCondition
    triggerFields
    requiredEmployeeFields
    recipients
    documents {
      id
      template
      order
    }
  }
`;

export const LEAVE_REQUEST_FIELDS = gql`
  fragment LeaveRequestFields on LeaveRequest {
    id
    employeeId
    employee {
      id
      employeeCode
      firstName
      lastName
      department
      jobTitle
      level
    }
    type
    startTime
    endTime
    reason
    status
    note
    createdAt
    updatedAt
  }
`;

export const CONTRACT_REQUEST_FIELDS = gql`
  fragment ContractRequestFields on ContractRequest {
    id
    employeeId
    employee {
      id
      employeeCode
      firstName
      lastName
      department
      jobTitle
      level
    }
    templateIds
    status
    note
    signatureMode
    createdAt
    updatedAt
    decidedAt
  }
`;
