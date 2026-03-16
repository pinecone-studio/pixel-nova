import { gql } from "@apollo/client";

import { ACTION_CONFIG_FIELDS } from "../fragments";

export const GET_ACTIONS = gql`
  query GetActions {
    actions {
      ...ActionConfigFields
    }
  }
  ${ACTION_CONFIG_FIELDS}
`;
