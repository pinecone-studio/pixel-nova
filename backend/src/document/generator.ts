import type { Employee } from "../db/schema";

interface GenerateDocumentInput {
  employee: Employee;
  action: string;
  generatedAt: string;
  documentId: string;
}

function normalizeAction(action: string) {
  return action.trim().toLowerCase();
}

function toSafeActionName(action: string) {
  const normalized = normalizeAction(action);
  return normalized.replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") || "action";
}

function joinLines(lines: Array<string | null>) {
  return lines.filter((line): line is string => line !== null).join("\n");
}

function buildDefaultContent(input: GenerateDocumentInput) {
  return joinLines([
    `Document ID: ${input.documentId}`,
    `Action: ${input.action.trim()}`,
    `Generated At: ${input.generatedAt}`,
    "",
    "Employee Summary",
    `- Employee Code: ${input.employee.employeeCode}`,
    `- Name: ${input.employee.firstName} ${input.employee.lastName}`,
    `- Department: ${input.employee.department}`,
    `- Branch: ${input.employee.branch}`,
    `- Level: ${input.employee.level}`,
    `- Hire Date: ${input.employee.hireDate}`,
    `- Status: ${input.employee.status}`,
    input.employee.terminationDate
      ? `- Termination Date: ${input.employee.terminationDate}`
      : null,
  ]);
}

function buildAddEmployeeContent(input: GenerateDocumentInput) {
  return joinLines([
    `Document ID: ${input.documentId}`,
    `Action: ${input.action.trim()}`,
    `Generated At: ${input.generatedAt}`,
    "",
    "Onboarding Letter",
    `Employee ${input.employee.firstName} ${input.employee.lastName} (${input.employee.employeeCode})`,
    `joins ${input.employee.department} at ${input.employee.branch} as ${input.employee.level}.`,
    `Start Date: ${input.employee.hireDate}`,
  ]);
}

function buildOffboardEmployeeContent(input: GenerateDocumentInput) {
  return joinLines([
    `Document ID: ${input.documentId}`,
    `Action: ${input.action.trim()}`,
    `Generated At: ${input.generatedAt}`,
    "",
    "Offboarding Notice",
    `Employee ${input.employee.firstName} ${input.employee.lastName} (${input.employee.employeeCode})`,
    `is marked for offboarding from ${input.employee.department} at ${input.employee.branch}.`,
    input.employee.terminationDate
      ? `Termination Date: ${input.employee.terminationDate}`
      : null,
  ]);
}

function buildPromoteEmployeeContent(input: GenerateDocumentInput) {
  return joinLines([
    `Document ID: ${input.documentId}`,
    `Action: ${input.action.trim()}`,
    `Generated At: ${input.generatedAt}`,
    "",
    "Promotion Notice",
    `Employee ${input.employee.firstName} ${input.employee.lastName} (${input.employee.employeeCode})`,
    `has been promoted to ${input.employee.level} in ${input.employee.department}.`,
    `Branch: ${input.employee.branch}`,
  ]);
}

function buildChangePositionContent(input: GenerateDocumentInput) {
  return joinLines([
    `Document ID: ${input.documentId}`,
    `Action: ${input.action.trim()}`,
    `Generated At: ${input.generatedAt}`,
    "",
    "Position Change Notice",
    `Employee ${input.employee.firstName} ${input.employee.lastName} (${input.employee.employeeCode})`,
    `is now assigned to ${input.employee.department} at ${input.employee.branch}.`,
    `Current Level: ${input.employee.level}`,
  ]);
}

function buildContent(input: GenerateDocumentInput) {
  switch (normalizeAction(input.action)) {
    case "add_employee":
      return buildAddEmployeeContent(input);
    case "offboard_employee":
      return buildOffboardEmployeeContent(input);
    case "promote_employee":
      return buildPromoteEmployeeContent(input);
    case "change_position":
      return buildChangePositionContent(input);
    default:
      return buildDefaultContent(input);
  }
}

export function generateEmployeeDocument(input: GenerateDocumentInput) {
  const content = buildContent(input).trim();
  const documentName = `${input.employee.employeeCode}-${toSafeActionName(input.action)}-${input.generatedAt.slice(0, 10)}.txt`;
  const storageUrl = `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`;

  return {
    documentName,
    storageUrl,
    content,
  };
}
