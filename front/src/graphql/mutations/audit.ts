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
