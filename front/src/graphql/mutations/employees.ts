import { gql } from "@apollo/client";

import { EMPLOYEE_FULL_FIELDS } from "../fragments";

export const UPSERT_EMPLOYEE = gql`
  mutation UpsertEmployee($input: UpsertEmployeeInput!) {
    upsertEmployee(input: $input) {
      employee {
        ...EmployeeFullFields
      }
      resolvedAction
    }
  }
  ${EMPLOYEE_FULL_FIELDS}
`;
