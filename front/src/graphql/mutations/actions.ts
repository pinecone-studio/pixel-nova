import { gql } from "@apollo/client";

import { ACTION_CONFIG_FIELDS } from "../fragments";

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

export const UPDATE_REGISTRY = gql`
  mutation UpdateRegistry($input: UpdateActionRegistryInput!) {
    updateRegistry(input: $input) {
      ...ActionConfigFields
    }
  }
  ${ACTION_CONFIG_FIELDS}
`;
