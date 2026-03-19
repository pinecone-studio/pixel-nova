import { gql } from "@apollo/client";

import { ACTION_CONFIG_FIELDS } from "../fragments";

export const TRIGGER_ACTION = gql`
  mutation TriggerAction(
    $employeeId: ID!
    $action: String!
    $dryRun: Boolean
    $overrideRecipients: [String!]
    $templateDataOverrides: JSON
  ) {
    triggerAction(
      employeeId: $employeeId
      action: $action
      dryRun: $dryRun
      overrideRecipients: $overrideRecipients
      templateDataOverrides: $templateDataOverrides
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
