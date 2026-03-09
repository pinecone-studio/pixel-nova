import Handlebars from "handlebars";

import type { Employee } from "../db/schema";

const defaultTemplateSource = `
Document ID: {{documentId}}
Action: {{action}}
Generated At: {{generatedAt}}

Employee Summary
- Employee Code: {{employee.employeeCode}}
- Name: {{employee.firstName}} {{employee.lastName}}
- Department: {{employee.department}}
- Branch: {{employee.branch}}
- Level: {{employee.level}}
- Hire Date: {{employee.hireDate}}
- Status: {{employee.status}}
{{#if employee.terminationDate}}
- Termination Date: {{employee.terminationDate}}
{{/if}}
`;

const actionTemplates: Record<string, string> = {
  onboarding: `
Document ID: {{documentId}}
Action: {{action}}
Generated At: {{generatedAt}}

Onboarding Letter
Employee {{employee.firstName}} {{employee.lastName}} ({{employee.employeeCode}})
joins {{employee.department}} at {{employee.branch}} as {{employee.level}}.
Start Date: {{employee.hireDate}}
`,
  offboarding: `
Document ID: {{documentId}}
Action: {{action}}
Generated At: {{generatedAt}}

Offboarding Notice
Employee {{employee.firstName}} {{employee.lastName}} ({{employee.employeeCode}})
is marked for offboarding from {{employee.department}} at {{employee.branch}}.
{{#if employee.terminationDate}}
Termination Date: {{employee.terminationDate}}
{{/if}}
`,
};

const defaultTemplate = Handlebars.compile(defaultTemplateSource.trim());
const compiledTemplates = Object.fromEntries(
  Object.entries(actionTemplates).map(([name, template]) => [
    name,
    Handlebars.compile(template.trim()),
  ]),
);

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

export function generateEmployeeDocument(input: GenerateDocumentInput) {
  const actionKey = normalizeAction(input.action);
  const template = compiledTemplates[actionKey] ?? defaultTemplate;
  const content = template({
    documentId: input.documentId,
    action: input.action.trim(),
    generatedAt: input.generatedAt,
    employee: input.employee,
  }).trim();

  const documentName = `${input.employee.employeeCode}-${toSafeActionName(input.action)}-${input.generatedAt.slice(0, 10)}.txt`;
  const storageUrl = `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`;

  return {
    documentName,
    storageUrl,
    content,
  };
}
