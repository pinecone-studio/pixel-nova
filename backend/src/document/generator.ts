import type { Employee } from "../db/schema";

// HTML template imports (bundled at build time by wrangler)
import employmentContractHtml from "./contractTemplates/employmentContract.html";
import probationOrderHtml from "./contractTemplates/probationOrder.html";
import jobDescriptionHtml from "./contractTemplates/jobDescription.html";
import ndaHtml from "./contractTemplates/nda.html";
import salaryIncreaseOrderHtml from "./contractTemplates/salaryIncreaseOrder.html";
import positionUpdateOrderHtml from "./contractTemplates/positionUpdateOrder.html";
import contractAddendumHtml from "./contractTemplates/contractAddendum.html";
import terminationOrderHtml from "./contractTemplates/terminationOrder.html";
import handoverSheetHtml from "./contractTemplates/handoverSheet.html";

// Template registry: template filename → imported HTML string
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
}

/**
 * HTML template-ийг employee мэдээллээр render хийнэ.
 * Template дотор байгаа placeholder цэгүүдийг хэвээр үлдээж,
 * document-ийн metadata-г HTML comment-ээр оруулна.
 */
function renderHtmlTemplate(
  templateHtml: string,
  input: GenerateDocumentInput,
): string {
  const { employee, action, generatedAt, documentId } = input;

  // Metadata comment-ийг HTML-ийн <body> дараа нэмнэ
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

  // <body> tag-ийн дараа metadata оруулна
  return templateHtml.replace(/<body[^>]*>/, (match) => `${match}\n${metadata}`);
}

/**
 * Plain text fallback (template олдохгүй бол)
 */
function buildPlainTextFallback(input: GenerateDocumentInput): string {
  const { employee, action, generatedAt, documentId } = input;
  const lines = [
    `Document ID: ${documentId}`,
    `Action: ${action}`,
    `Generated At: ${generatedAt}`,
    "",
    "Employee Summary",
    `- Employee Code: ${employee.employeeCode}`,
    `- Name: ${employee.firstName} ${employee.lastName}`,
    `- Department: ${employee.department}`,
    `- Branch: ${employee.branch}`,
    `- Level: ${employee.level}`,
    `- Hire Date: ${employee.hireDate}`,
    `- Status: ${employee.status}`,
  ];
  if (employee.terminationDate) {
    lines.push(`- Termination Date: ${employee.terminationDate}`);
  }
  return lines.join("\n");
}

export function generateEmployeeDocument(input: GenerateDocumentInput) {
  const templateFile = input.templateFile;
  const templateHtml = templateFile ? TEMPLATE_MAP[templateFile] : undefined;

  if (templateHtml) {
    // HTML template render
    const content = renderHtmlTemplate(templateHtml, input);
    const safeName = input.templateFile!.replace(".html", "");
    const documentName = `${input.employee.employeeCode}-${safeName}-${input.generatedAt.slice(0, 10)}.html`;

    return {
      documentName,
      storageUrl: "", // R2 upload хийгдсэний дараа бөглөгдөнө
      content,
      contentType: "text/html",
    };
  }

  // Fallback: plain text
  const content = buildPlainTextFallback(input);
  const documentName = `${input.employee.employeeCode}-${input.action.replace(/[^a-z0-9-]+/gi, "-")}-${input.generatedAt.slice(0, 10)}.txt`;
  const storageUrl = `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`;

  return {
    documentName,
    storageUrl,
    content,
    contentType: "text/plain",
  };
}
