import type { Employee } from "../db/schema";
import { buildTemplateData } from "./templateData";

import employmentContractHtml from "./contractTemplates/employmentContract.html";
import probationOrderHtml from "./contractTemplates/probationOrder.html";
import jobDescriptionHtml from "./contractTemplates/jobDescription.html";
import ndaHtml from "./contractTemplates/nda.html";
import salaryIncreaseOrderHtml from "./contractTemplates/salaryIncreaseOrder.html";
import positionUpdateOrderHtml from "./contractTemplates/positionUpdateOrder.html";
import contractAddendumHtml from "./contractTemplates/contractAddendum.html";
import terminationOrderHtml from "./contractTemplates/terminationOrder.html";
import handoverSheetHtml from "./contractTemplates/handoverSheet.html";

const TEMPLATE_MAP: Record<string, string> = {
  "employment_contract.html": employmentContractHtml,
  "probation_order.html": probationOrderHtml,
  "job_description.html": jobDescriptionHtml,
  "nda.html": ndaHtml,
  "salary_increase_order.html": salaryIncreaseOrderHtml,
  "position_update_order.html": positionUpdateOrderHtml,
  "contract_addendum.html": contractAddendumHtml,
  "termination_order.html": terminationOrderHtml,
  "handover_sheet.html": handoverSheetHtml,
};

export interface GenerateDocumentInput {
  employee: Employee;
  action: string;
  generatedAt: string;
  documentId: string;
  templateFile?: string;
  templateData?: Record<string, string>;
}

export interface GeneratedDocumentTemplate {
  documentName: string;
  html: string;
}

function renderTemplateTokens(
  templateHtml: string,
  templateData: Record<string, string>,
): string {
  return templateHtml.replace(/\{\{\{?\s*([a-zA-Z0-9_]+)\s*\}?\}\}/g, (_match, token: string) => {
    return templateData[token] ?? "";
  });
}

function stripUnresolvedTemplateTokens(templateHtml: string): string {
  return templateHtml.replace(/\{\{\{?[\s\S]*?\}?\}\}/g, "");
}

function renderHtmlTemplate(
  templateHtml: string,
  input: GenerateDocumentInput,
): string {
  const { employee, action, generatedAt, documentId } = input;

  const templateData = input.templateData ?? buildTemplateData(employee, generatedAt);
  const renderedHtml = stripUnresolvedTemplateTokens(
    renderTemplateTokens(templateHtml, templateData),
  );

  const metadata = `
<!-- EPAS Document Metadata
  Document ID: ${documentId}
  Action: ${action}
  Generated: ${generatedAt}
  Employee: ${employee.employeeCode} - ${employee.lastName} ${employee.firstName}
  Department: ${employee.department}
  Branch: ${employee.branch}
  Level: ${employee.level}
  Status: ${employee.status}
-->`;

  return renderedHtml.replace(/<body[^>]*>/, (match: string) => `${match}\n${metadata}`);
}

function buildHtmlFallback(input: GenerateDocumentInput): string {
  const { employee, action, generatedAt, documentId } = input;
  return `<!doctype html>
<html lang="mn">
  <head>
    <meta charset="UTF-8" />
    <title>${employee.employeeCode} ${action}</title>
    <style>
      body { font-family: "Times New Roman", serif; margin: 32px; color: #111; }
      h1 { font-size: 20px; margin-bottom: 16px; }
      p { margin: 0 0 8px; line-height: 1.5; }
    </style>
  </head>
  <body>
    <h1>EPAS Document</h1>
    <p>Document ID: ${documentId}</p>
    <p>Action: ${action}</p>
    <p>Generated At: ${generatedAt}</p>
    <p>Employee Code: ${employee.employeeCode}</p>
    <p>Name: ${employee.lastName} ${employee.firstName}</p>
    <p>Department: ${employee.department}</p>
    <p>Branch: ${employee.branch}</p>
    <p>Level: ${employee.level}</p>
    <p>Status: ${employee.status}</p>
  </body>
</html>`;
}

export function generateEmployeeDocument(input: GenerateDocumentInput): GeneratedDocumentTemplate {
  const templateFile = input.templateFile;
  const templateHtml = templateFile ? TEMPLATE_MAP[templateFile] : undefined;
  const safeName = (templateFile ?? input.action).replace(".html", "");
  const documentName = `${input.employee.employeeCode}-${safeName}-${input.generatedAt.slice(0, 10)}.pdf`;

  return {
    documentName,
    html: templateHtml
      ? renderHtmlTemplate(templateHtml, input)
      : buildHtmlFallback(input),
  };
}
