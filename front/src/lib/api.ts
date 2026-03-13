import { graphql, getDocumentPreviewUrl } from "./graphql-client";
import type {
  Document,
  AuditLog,
  ActionConfig,
  DocumentContent,
  TriggerActionResult,
  RequestOtpResult,
  AuthSession,
  Employee,
  LeaveRequest,
  UploadHrDocumentInput,
  UpsertEmployeeInput,
  UpsertEmployeeResult,
} from "./types";

export async function fetchEmployees(filters?: {
  search?: string;
  status?: string;
  department?: string;
}): Promise<Employee[]> {
  const data = await graphql<{ employees: Employee[] }>(
    `query ($search: String, $status: String, $department: String) {
      employees(search: $search, status: $status, department: $department) {
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
      }
    }`,
    {
      search: filters?.search ?? null,
      status: filters?.status ?? null,
      department: filters?.department ?? null,
    },
    { actorRole: "hr" },
  );

  return data.employees;
}

export async function fetchDocuments(
  employeeId: string,
  authToken?: string,
  actorRole?: "hr" | "employee",
): Promise<Document[]> {
  const data = await graphql<{ documents: Document[] }>(
    `query ($employeeId: ID!) {
      documents(employeeId: $employeeId) {
        id
        employeeId
        action
        documentName
        storageUrl
        createdAt
      }
    }`,
    { employeeId },
    authToken || actorRole
      ? {
          ...(authToken ? { authToken } : {}),
          ...(actorRole ? { actorRole } : {}),
        }
      : undefined,
  );
  return data.documents;
}

export async function fetchAuditLogs(
  employeeId?: string,
  authToken?: string,
): Promise<AuditLog[]> {
  const data = await graphql<{ auditLogs: AuditLog[] }>(
    `query ($employeeId: ID) {
      auditLogs(employeeId: $employeeId) {
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
    }`,
    employeeId ? { employeeId } : {},
    authToken ? { authToken } : undefined,
  );
  return data.auditLogs;
}

export async function fetchActions(): Promise<ActionConfig[]> {
  const data = await graphql<{ actions: ActionConfig[] }>(
    `query {
      actions {
        id
        name
        phase
        triggerFields
      }
    }`,
  );
  return data.actions;
}

export async function fetchDocumentContent(
  documentId: string,
  authToken?: string,
  actorRole?: "hr" | "employee",
): Promise<DocumentContent | null> {
  const data = await graphql<{ documentContent: DocumentContent | null }>(
    `query ($documentId: ID!) {
      documentContent(documentId: $documentId) {
        id
        documentName
        contentType
        content
      }
    }`,
    { documentId },
    authToken || actorRole
      ? {
          ...(authToken ? { authToken } : {}),
          ...(actorRole ? { actorRole } : {}),
        }
      : undefined,
  );
  return data.documentContent;
}

export async function uploadHrDocument(
  input: UploadHrDocumentInput,
): Promise<Document> {
  const data = await graphql<{ uploadHrDocument: Document }>(
    `mutation ($input: UploadHrDocumentInput!) {
      uploadHrDocument(input: $input) {
        id
        employeeId
        action
        documentName
        storageUrl
        createdAt
      }
    }`,
    { input },
    { actorRole: "hr" },
  );

  return data.uploadHrDocument;
}

export async function triggerAction(
  employeeId: string,
  action: string,
): Promise<TriggerActionResult> {
  const data = await graphql<{ triggerAction: TriggerActionResult }>(
    `mutation ($employeeId: ID!, $action: String!) {
      triggerAction(employeeId: $employeeId, action: $action) {
        employee {
          id
          firstName
          lastName
          department
          jobTitle
          level
        }
        documents {
          id
          documentName
          action
          createdAt
        }
        auditLog {
          id
          action
          documentsGenerated
          recipientsNotified
          timestamp
        }
      }
    }`,
    { employeeId, action },
  );
  return data.triggerAction;
}

export async function upsertEmployee(
  input: UpsertEmployeeInput,
): Promise<UpsertEmployeeResult> {
  const data = await graphql<{ upsertEmployee: UpsertEmployeeResult }>(
    `mutation ($input: UpsertEmployeeInput!) {
      upsertEmployee(input: $input) {
        employee {
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
        }
        resolvedAction
      }
    }`,
    { input },
    { actorRole: "hr" },
  );

  return data.upsertEmployee;
}

export async function requestOtp(employeeCode: string): Promise<RequestOtpResult> {
  const data = await graphql<{ requestOtp: RequestOtpResult }>(
    `mutation ($employeeCode: String!) {
      requestOtp(employeeCode: $employeeCode) {
        success
        maskedEmail
        expiresAt
      }
    }`,
    { employeeCode },
  );

  return data.requestOtp;
}

export async function verifyOtp(employeeCode: string, code: string): Promise<AuthSession> {
  const data = await graphql<{ verifyOtp: AuthSession }>(
    `mutation ($employeeCode: String!, $code: String!) {
      verifyOtp(employeeCode: $employeeCode, code: $code) {
        token
        expiresAt
        employee {
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
      }
    }`,
    { employeeCode, code },
  );

  return data.verifyOtp;
}

export async function loginWithCode(employeeCode: string): Promise<AuthSession> {
  const data = await graphql<{ loginWithCode: AuthSession }>(
    `mutation ($employeeCode: String!) {
      loginWithCode(employeeCode: $employeeCode) {
        token
        expiresAt
        employee {
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
      }
    }`,
    { employeeCode },
  );

  return data.loginWithCode;
}

export async function fetchMe(authToken: string): Promise<Employee | null> {
  const data = await graphql<{ me: Employee | null }>(
    `query {
      me {
        id
        employeeCode
        firstName
        lastName
        firstNameEng
        lastNameEng
        department
        branch
        jobTitle
        level
        email
        status
        hireDate
        imageUrl
        github
        entraId
        birthDayAndMonth
        isKpi
        isSalaryCompany
      }
    }`,
    undefined,
    { authToken },
  );

  return data.me;
}

export async function logout(authToken: string): Promise<boolean> {
  const data = await graphql<{ logout: boolean }>(
    `mutation {
      logout
    }`,
    undefined,
    { authToken },
  );

  return data.logout;
}

const LEAVE_REQUEST_FIELDS = `
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
`;

export async function submitLeaveRequest(
  data: { type: string; startTime: string; endTime: string; reason: string },
  authToken: string,
): Promise<LeaveRequest> {
  const result = await graphql<{ submitLeaveRequest: LeaveRequest }>(
    `mutation ($type: String!, $startTime: String!, $endTime: String!, $reason: String!) {
      submitLeaveRequest(type: $type, startTime: $startTime, endTime: $endTime, reason: $reason) {
        ${LEAVE_REQUEST_FIELDS}
      }
    }`,
    data,
    { authToken },
  );
  return result.submitLeaveRequest;
}

export async function fetchLeaveRequests(status?: string): Promise<LeaveRequest[]> {
  const result = await graphql<{ leaveRequests: LeaveRequest[] }>(
    `query ($status: String) {
      leaveRequests(status: $status) {
        ${LEAVE_REQUEST_FIELDS}
      }
    }`,
    { status: status ?? null },
    { actorRole: "hr" },
  );
  return result.leaveRequests;
}

export async function fetchMyLeaveRequests(authToken: string): Promise<LeaveRequest[]> {
  const result = await graphql<{ myLeaveRequests: LeaveRequest[] }>(
    `query {
      myLeaveRequests {
        ${LEAVE_REQUEST_FIELDS}
      }
    }`,
    undefined,
    { authToken },
  );
  return result.myLeaveRequests;
}

export async function approveLeaveRequest(id: string, note?: string): Promise<LeaveRequest> {
  const result = await graphql<{ approveLeaveRequest: LeaveRequest }>(
    `mutation ($id: ID!, $note: String) {
      approveLeaveRequest(id: $id, note: $note) {
        ${LEAVE_REQUEST_FIELDS}
      }
    }`,
    { id, note: note ?? null },
    { actorRole: "hr" },
  );
  return result.approveLeaveRequest;
}

export async function rejectLeaveRequest(id: string, note?: string): Promise<LeaveRequest> {
  const result = await graphql<{ rejectLeaveRequest: LeaveRequest }>(
    `mutation ($id: ID!, $note: String) {
      rejectLeaveRequest(id: $id, note: $note) {
        ${LEAVE_REQUEST_FIELDS}
      }
    }`,
    { id, note: note ?? null },
    { actorRole: "hr" },
  );
  return result.rejectLeaveRequest;
}

export { getDocumentPreviewUrl };
