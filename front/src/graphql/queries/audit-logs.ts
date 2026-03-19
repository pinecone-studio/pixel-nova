import { gql } from "@apollo/client";

import { AUDIT_LOG_FIELDS } from "../fragments";

export const GET_AUDIT_LOGS = gql`
  query GetAuditLogs($employeeId: ID, $action: String, $fromDate: String, $toDate: String) {
    auditLogs(employeeId: $employeeId, action: $action, fromDate: $fromDate, toDate: $toDate) {
      ...AuditLogFields
    }
  }
  ${AUDIT_LOG_FIELDS}
`;
