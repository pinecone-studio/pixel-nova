import { gql } from "@apollo/client";

import { PROCESSED_EVENT_FIELDS } from "../fragments";

export const GET_PROCESSED_EVENTS = gql`
  query GetProcessedEvents($employeeId: ID, $status: String) {
    processedEvents(employeeId: $employeeId, status: $status) {
      ...ProcessedEventFields
    }
  }
  ${PROCESSED_EVENT_FIELDS}
`;
