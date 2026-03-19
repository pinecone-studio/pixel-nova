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

export const GET_HR_NOTIFICATIONS = gql`
  query GetHrNotifications {
    hrNotifications {
      id
      title
      body
      status
      createdAt
      sourceType
    }
  }
`;
