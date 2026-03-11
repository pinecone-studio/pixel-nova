import { graphql, getDocumentPreviewUrl } from "./graphql-client";
import type {
  Document,
  AuditLog,
  ActionConfig,
  DocumentContent,
  TriggerActionResult,
} from "./types";

// ===== QUERIES =====

export async function fetchDocuments(
  employeeId: string,
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
  );
  return data.documents;
}

export async function fetchAllDocuments(): Promise<Document[]> {
  const data = await graphql<{ documents: Document[] }>(
    `query {
      documents(employeeId: "all") {
        id
        employeeId
        action
        documentName
        storageUrl
        createdAt
      }
    }`,
  );
  return data.documents;
}

export async function fetchAuditLogs(
  employeeId?: string,
): Promise<AuditLog[]> {
  const data = await graphql<{ auditLogs: AuditLog[] }>(
    `query ($employeeId: ID) {
      auditLogs(employeeId: $employeeId) {
        id
        employeeId
        action
        documentsGenerated
        recipientsNotified
        timestamp
      }
    }`,
    employeeId ? { employeeId } : {},
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
  );
  return data.documentContent;
}

// ===== MUTATIONS =====

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

export { getDocumentPreviewUrl };
