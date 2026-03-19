import { gql } from "@apollo/client";

import { CONTRACT_REQUEST_FIELDS } from "../fragments";

export const GET_CONTRACT_REQUESTS = gql`
  query GetContractRequests($status: String) {
    contractRequests(status: $status) {
      ...ContractRequestFields
    }
  }
  ${CONTRACT_REQUEST_FIELDS}
`;

export const GET_MY_CONTRACT_REQUESTS = gql`
  query GetMyContractRequests {
    myContractRequests {
      ...ContractRequestFields
    }
  }
  ${CONTRACT_REQUEST_FIELDS}
`;

export const GET_SIGNATURE_STATUS = gql`
  query GetSignatureStatus {
    mySignatureStatus {
      hasSignature
      hasPasscode
      updatedAt
    }
  }
`;

export const GET_EMPLOYER_SIGNATURE_STATUS = gql`
  query GetEmployerSignatureStatus {
    employerSignatureStatus {
      hasSignature
      hasPasscode
      updatedAt
    }
  }
`;

export const GET_EMPLOYEE_SIGNATURE = gql`
  query GetEmployeeSignature($employeeId: ID!) {
    employeeSignature(employeeId: $employeeId) {
      employeeId
      signatureData
      updatedAt
    }
  }
`;
