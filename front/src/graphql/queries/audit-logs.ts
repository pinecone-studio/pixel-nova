import { gql } from "@apollo/client";

import { AUDIT_LOG_FIELDS } from "../fragments";

export const GET_AUDIT_LOGS = gql`
  query GetAuditLogs($employeeId: ID) {
    auditLogs(employeeId: $employeeId) {
      ...AuditLogFields
    }
  }
  ${AUDIT_LOG_FIELDS}
`;
