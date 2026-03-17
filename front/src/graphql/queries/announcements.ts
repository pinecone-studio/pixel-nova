import { gql } from "@apollo/client";

export const GET_ANNOUNCEMENTS = gql`
  query GetAnnouncements {
    announcements {
      id
      title
      body
      status
      audience
      createdBy
      createdAt
      updatedAt
      publishedAt
      recipientCount
      readCount
    }
  }
`;
