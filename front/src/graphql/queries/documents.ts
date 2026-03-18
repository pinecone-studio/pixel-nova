import { gql } from "@apollo/client";

import { DOCUMENT_CONTENT_FIELDS, DOCUMENT_FIELDS } from "../fragments";

export const GET_DOCUMENTS = gql`
  query GetDocuments($employeeId: ID!) {
    documents(employeeId: $employeeId) {
      ...DocumentFields
    }
  }
  ${DOCUMENT_FIELDS}
`;

export const GET_DOCUMENT_CONTENT = gql`
  query GetDocumentContent($documentId: ID!) {
    documentContent(documentId: $documentId) {
      ...DocumentContentFields
    }
  }
  ${DOCUMENT_CONTENT_FIELDS}
`;

export const GET_CONTRACT_TEMPLATE = gql`
  query GetContractTemplate($templateId: String!) {
    contractTemplate(templateId: $templateId) {
      ...DocumentContentFields
    }
  }
  ${DOCUMENT_CONTENT_FIELDS}
`;
