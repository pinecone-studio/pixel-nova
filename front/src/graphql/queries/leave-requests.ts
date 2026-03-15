import { gql } from "@apollo/client";

import { LEAVE_REQUEST_FIELDS } from "../fragments";

export const GET_LEAVE_REQUESTS = gql`
  query GetLeaveRequests($status: String) {
    leaveRequests(status: $status) {
      ...LeaveRequestFields
    }
  }
  ${LEAVE_REQUEST_FIELDS}
`;
