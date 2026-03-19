import type { NormalizedActionConfig } from "../db/queries";
import type { Document, Employee } from "../db/schema";
import { generateEmployeeDocument } from "../document/generator";
import { renderPdfFromService } from "../document/pdfRenderer";
import { buildTemplateData } from "../document/templateData";

export type SigningRole = "hr" | "employee";

export interface SignedDocumentArtifact {
  renderedPdf: boolean;
  contentType: string;
  bytes: Uint8Array;
  html: string;
}

function parseDocumentTemplateData(
  templateData: string | null | undefined,
) {
  if (!templateData) {
    return {};
  }

  try {
    const parsed = JSON.parse(templateData);
    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>).map(([key, value]) => [
        key,
        value == null ? "" : String(value),
      ]),
    );
  } catch {
    return {};
  }
}

function buildSignatureHtml(signatureData: string) {
  return `<img src="${signatureData}" style="height:40px; filter: brightness(0) saturate(100%);" />`;
}

function resolveTemplateFile(
  document: Pick<Document, "templateFile" | "templateId" | "documentName">,
  actionConfig?: NormalizedActionConfig | null,
) {
  if (document.templateFile?.trim()) {
    return document.templateFile.trim();
  }

  const templateId =
    document.templateId?.trim() ||
    document.documentName.replace(/\.pdf$/i, "").split("_").slice(1).join("_");
  if (!templateId) {
    return null;
  }

  return (
    actionConfig?.documents.find((item) => item.id === templateId)?.template ??
    null
  );
}

function buildSignatureOverrides(
  role: SigningRole,
  signatureData: string,
  signedAt: string,
): Record<string, string> {
  const signatureHtml = buildSignatureHtml(signatureData);
  const signDate = signedAt.slice(0, 10);

  if (role === "hr") {
    return {
      issuer_signature: signatureHtml,
      issuer_sign_line: signatureHtml,
      issuer_date: signDate,
      employer_signature: signatureHtml,
      employer_sign_line: signatureHtml,
      employer_sign_date: signDate,
      company_ceo_sign_line: signatureHtml,
      hr_manager_signature: signatureHtml,
    };
  }

  return {
    employee_signature: signatureHtml,
    employee_sign_line: signatureHtml,
    employee_sign_date: signDate,
    employee_ack_date: signDate,
  };
}

export async function renderSignedDocumentArtifact(input: {
  employee: Employee;
  document: Document;
  actionConfig?: NormalizedActionConfig | null;
  signatureData: string;
  signedAt: string;
  role: SigningRole;
  rendererUrl?: string | null;
  rendererSecret?: string | null;
}) {
  const templateFile = resolveTemplateFile(input.document, input.actionConfig);
  if (!templateFile) {
    throw new Error("Unable to resolve document template");
  }

  const templateData = {
    ...buildTemplateData(input.employee, input.document.createdAt),
    ...parseDocumentTemplateData(input.document.templateData),
    ...buildSignatureOverrides(input.role, input.signatureData, input.signedAt),
  };

  const generated = generateEmployeeDocument({
    employee: input.employee,
    action: input.document.action,
    generatedAt: input.document.createdAt,
    documentId: input.document.id,
    templateFile,
    templateData,
  });

  const rendererUrl = input.rendererUrl?.trim() ?? "";
  if (!rendererUrl) {
    return {
      renderedPdf: false,
      contentType: "text/html;charset=utf-8",
      bytes: new TextEncoder().encode(generated.html),
      html: generated.html,
    };
  }

  try {
    const bytes = await renderPdfFromService({
      html: generated.html,
      documentName: input.document.documentName,
      serviceUrl: rendererUrl,
      secret: input.rendererSecret,
    });

    return {
      renderedPdf: true,
      contentType: "application/pdf",
      bytes,
      html: generated.html,
    };
  } catch (error) {
    console.error("Signed PDF render failed", error);
    return {
      renderedPdf: false,
      contentType: "text/html;charset=utf-8",
      bytes: new TextEncoder().encode(generated.html),
      html: generated.html,
    };
  }
}
