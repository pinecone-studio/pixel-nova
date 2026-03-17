import { gql } from "@apollo/client";

export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(id: $id) {
      id
      status
      readAt
    }
  }
`;

export const SEND_ANNOUNCEMENT = gql`
  mutation SendAnnouncement($title: String!, $body: String!) {
    sendAnnouncement(title: $title, body: $body)
  }
`;

export const CREATE_ANNOUNCEMENT_DRAFT = gql`
  mutation CreateAnnouncementDraft(
    $title: String!
    $body: String!
    $audience: String
  ) {
    createAnnouncementDraft(title: $title, body: $body, audience: $audience) {
      id
      title
      body
      status
      audience
      createdAt
      updatedAt
      publishedAt
    }
  }
`;

export const UPDATE_ANNOUNCEMENT_DRAFT = gql`
  mutation UpdateAnnouncementDraft(
    $id: ID!
    $title: String!
    $body: String!
    $audience: String
  ) {
    updateAnnouncementDraft(id: $id, title: $title, body: $body, audience: $audience) {
      id
      title
      body
      status
      audience
      createdAt
      updatedAt
      publishedAt
    }
  }
`;

export const PUBLISH_ANNOUNCEMENT = gql`
  mutation PublishAnnouncement($id: ID!) {
    publishAnnouncement(id: $id) {
      id
      status
      publishedAt
    }
  }
`;
