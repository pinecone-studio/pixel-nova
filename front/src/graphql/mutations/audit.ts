import { gql } from "@apollo/client";

import { AUDIT_LOG_FIELDS } from "../fragments";

export const RETRY_NOTIFICATION = gql`
  mutation RetryNotification($auditLogId: ID!) {
    retryNotification(auditLogId: $auditLogId) {
      ...AuditLogFields
    }
  }
  ${AUDIT_LOG_FIELDS}
`;

export const SIGN_AUDIT_LOG = gql`
  mutation SignAuditLog(
    $auditLogId: ID!
    $signatureMode: String
    $signatureData: String
    $passcode: String
  ) {
    signAuditLog(
      auditLogId: $auditLogId
      signatureMode: $signatureMode
      signatureData: $signatureData
      passcode: $passcode
    ) {
      ...AuditLogFields
    }
  }
  ${AUDIT_LOG_FIELDS}
`;
