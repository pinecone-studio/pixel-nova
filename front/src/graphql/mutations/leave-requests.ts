import { gql } from "@apollo/client";

import { LEAVE_REQUEST_FIELDS } from "../fragments";

export const SUBMIT_LEAVE_REQUEST = gql`
  mutation SubmitLeaveRequest(
    $type: String!
    $startTime: String!
    $endTime: String!
    $reason: String!
    $attachments: [LeaveRequestAttachmentInput!]
  ) {
    submitLeaveRequest(
      type: $type
      startTime: $startTime
      endTime: $endTime
      reason: $reason
      attachments: $attachments
    ) {
      ...LeaveRequestFields
    }
  }
  ${LEAVE_REQUEST_FIELDS}
`;

export const APPROVE_LEAVE_REQUEST = gql`
  mutation ApproveLeaveRequest($id: ID!, $note: String) {
    approveLeaveRequest(id: $id, note: $note) {
      ...LeaveRequestFields
    }
  }
  ${LEAVE_REQUEST_FIELDS}
`;

export const REJECT_LEAVE_REQUEST = gql`
  mutation RejectLeaveRequest($id: ID!, $note: String) {
    rejectLeaveRequest(id: $id, note: $note) {
      ...LeaveRequestFields
    }
  }
  ${LEAVE_REQUEST_FIELDS}
`;
