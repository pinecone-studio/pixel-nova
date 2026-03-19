import { gql } from "@apollo/client";

import { DOCUMENT_FIELDS } from "../fragments";

export const UPLOAD_HR_DOCUMENT = gql`
  mutation UploadHrDocument($input: UploadHrDocumentInput!) {
    uploadHrDocument(input: $input) {
      ...DocumentFields
    }
  }
  ${DOCUMENT_FIELDS}
`;

export const DELETE_DOCUMENT = gql`
  mutation DeleteDocument($id: ID!) {
    deleteDocument(id: $id) {
      ...DocumentFields
    }
  }
  ${DOCUMENT_FIELDS}
`;

