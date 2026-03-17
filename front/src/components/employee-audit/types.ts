export type AuditView = "newEmployee" | "documentReview" | "statusUpdate";

export type ListFilter =
  | "all"
  | "engineering"
  | "fourDocs"
  | "updates"
  | "newDocs"
  | "gold";

export type FilterOption = {
  value: ListFilter;
  label: string;
};

export type EmployeeRequestFile = {
  id: string;
  title: string;
  fileName: string;
};

export type EmployeeRequest = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  role: string;
  submittedAt: string;
  files: EmployeeRequestFile[];
};

export type DocumentReview = {
  id: string;
  title: string;
  modalTitle: string;
  description: string;
  fileTitle: string;
  fileName: string;
  badge: string;
  badgeTone: "blue" | "gold";
  avatarColor: string;
  avatarLabel: string;
};

export type StatusUpdate = {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  tone: "gold" | "emerald";
};
