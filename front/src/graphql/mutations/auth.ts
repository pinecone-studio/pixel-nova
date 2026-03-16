import { gql } from "@apollo/client";

import { EMPLOYEE_SUMMARY_FIELDS } from "../fragments";

export const LOGIN_WITH_CODE = gql`
  mutation LoginWithCode($employeeCode: String!) {
    loginWithCode(employeeCode: $employeeCode) {
      token
      expiresAt
      employee {
        ...EmployeeSummaryFields
      }
    }
  }
  ${EMPLOYEE_SUMMARY_FIELDS}
`;
