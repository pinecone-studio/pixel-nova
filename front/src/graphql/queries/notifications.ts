import { gql } from "@apollo/client";

export const GET_MY_NOTIFICATIONS = gql`
  query GetMyNotifications {
    myNotifications {
      id
      employeeId
      title
      body
      status
      createdAt
      readAt
    }
  }
`;
