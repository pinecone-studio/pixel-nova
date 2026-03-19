import { gql } from "@apollo/client";

import { AUDIT_LOG_FIELDS, DOCUMENT_FIELDS } from "../fragments";

export const UPLOAD_HR_DOCUMENT = gql`
  mutation UploadHrDocument($input: UploadHrDocumentInput!) {
    uploadHrDocument(input: $input) {
      ...DocumentFields
    }
  }
  ${DOCUMENT_FIELDS}
`;

export const DELETE_DOCUMENT = gql`
  mutation DeleteDocument($id: ID!) {
    deleteDocument(id: $id) {
      ...DocumentFields
    }
  }
  ${DOCUMENT_FIELDS}
`;

export const SIGN_DOCUMENT = gql`
  mutation SignDocument(
    $documentId: ID!
    $signatureMode: String
    $signatureData: String
    $passcode: String
  ) {
    signDocument(
      documentId: $documentId
      signatureMode: $signatureMode
      signatureData: $signatureData
      passcode: $passcode
    ) {
      document {
        ...DocumentFields
      }
      auditLog {
        ...AuditLogFields
      }
      allSigned
    }
  }
  ${DOCUMENT_FIELDS}
  ${AUDIT_LOG_FIELDS}
`;

export const EMPLOYEE_SIGN_DOCUMENT = gql`
  mutation EmployeeSignDocument(
    $documentId: ID!
    $signatureMode: String
    $signatureData: String
    $passcode: String
  ) {
    employeeSignDocument(
      documentId: $documentId
      signatureMode: $signatureMode
      signatureData: $signatureData
      passcode: $passcode
    ) {
      document {
        ...DocumentFields
      }
      auditLog {
        ...AuditLogFields
      }
      allSigned
    }
  }
  ${DOCUMENT_FIELDS}
  ${AUDIT_LOG_FIELDS}
`;

