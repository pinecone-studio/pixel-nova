import { gql } from "@apollo/client";

import { EMPLOYEE_FULL_FIELDS } from "../fragments";

export const UPDATE_MY_DOCUMENT_PROFILE = gql`
  mutation UpdateMyDocumentProfile($input: JSON!) {
    updateMyDocumentProfile(input: $input) {
      ...EmployeeFullFields
    }
  }
  ${EMPLOYEE_FULL_FIELDS}
`;
