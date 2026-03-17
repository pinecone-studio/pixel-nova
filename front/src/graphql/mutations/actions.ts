import { gql } from "@apollo/client";

export const TRIGGER_ACTION = gql`
  mutation TriggerAction(
    $employeeId: ID!
    $action: String!
    $dryRun: Boolean
    $overrideRecipients: [String!]
  ) {
    triggerAction(
      employeeId: $employeeId
      action: $action
      dryRun: $dryRun
      overrideRecipients: $overrideRecipients
    ) {
      auditLog {
        id
        action
        timestamp
      }
    }
  }
`;
