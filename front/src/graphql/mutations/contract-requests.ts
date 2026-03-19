import { gql } from "@apollo/client";

import { CONTRACT_REQUEST_FIELDS } from "../fragments";

export const SUBMIT_CONTRACT_REQUEST = gql`
  mutation SubmitContractRequest(
    $templateIds: [String!]!
    $signatureMode: String
    $passcode: String
    $signatureData: String
  ) {
    submitContractRequest(
      templateIds: $templateIds
      signatureMode: $signatureMode
      passcode: $passcode
      signatureData: $signatureData
    ) {
      ...ContractRequestFields
    }
  }
  ${CONTRACT_REQUEST_FIELDS}
`;

export const APPROVE_CONTRACT_REQUEST = gql`
  mutation ApproveContractRequest(
    $id: ID!
    $note: String
    $employerSignatureMode: String
    $employerPasscode: String
    $employerSignatureData: String
  ) {
    approveContractRequest(
      id: $id
      note: $note
      employerSignatureMode: $employerSignatureMode
      employerPasscode: $employerPasscode
      employerSignatureData: $employerSignatureData
    ) {
      ...ContractRequestFields
    }
  }
  ${CONTRACT_REQUEST_FIELDS}
`;

export const REJECT_CONTRACT_REQUEST = gql`
  mutation RejectContractRequest($id: ID!, $note: String) {
    rejectContractRequest(id: $id, note: $note) {
      ...ContractRequestFields
    }
  }
  ${CONTRACT_REQUEST_FIELDS}
`;

export const SAVE_MY_SIGNATURE = gql`
  mutation SaveMySignature($signatureData: String!, $passcode: String) {
    saveMySignature(signatureData: $signatureData, passcode: $passcode) {
      hasSignature
      hasPasscode
      updatedAt
    }
  }
`;

export const SAVE_EMPLOYER_SIGNATURE = gql`
  mutation SaveEmployerSignature($signatureData: String!, $passcode: String) {
    saveEmployerSignature(signatureData: $signatureData, passcode: $passcode) {
      hasSignature
      hasPasscode
      updatedAt
    }
  }
`;

export const DELETE_EMPLOYER_SIGNATURE = gql`
  mutation DeleteEmployerSignature {
    deleteEmployerSignature {
      hasSignature
      hasPasscode
      updatedAt
    }
  }
`;
