import { gql } from "@apollo/client";

import { EMPLOYEE_FULL_FIELDS } from "../fragments";

export const GET_EMPLOYEES = gql`
  query GetEmployees($search: String, $status: String, $department: String) {
    employees(search: $search, status: $status, department: $department) {
      ...EmployeeFullFields
    }
  }
  ${EMPLOYEE_FULL_FIELDS}
`;

export const GET_ME = gql`
  query GetMe {
    me {
      ...EmployeeFullFields
    }
  }
  ${EMPLOYEE_FULL_FIELDS}
`;
