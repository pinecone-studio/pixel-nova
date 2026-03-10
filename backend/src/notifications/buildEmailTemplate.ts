export interface EmailTemplateInput {
  employeeName: string;
  employeeCode: string;
  action: string;
  documentName: string;
  documentUrl: string;
  generatedAt: string;
}

export interface EmailTemplate {
  subject: string;
  text: string;
}

export function buildEmailTemplate(input: EmailTemplateInput): EmailTemplate {
  const subject = `[EPAS] ${input.action} — ${input.employeeName} (${input.employeeCode})`;

  const text = [
    `EPAS Notification`,
    ``,
    `Employee: ${input.employeeName}`,
    `Employee Code: ${input.employeeCode}`,
    `Action: ${input.action}`,
    `Generated At: ${input.generatedAt}`,
    ``,
    `Document: ${input.documentName}`,
    `URL: ${input.documentUrl}`,
    ``,
    `This is an automated notification from EPAS HR System.`,
  ].join("\n");

  return { subject, text };
}
