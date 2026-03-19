import { and, eq } from "drizzle-orm";

import type { DbClient } from "../client";
import { auditLog, documents } from "../schema";
import { generateEmployeeDocument } from "../../document/generator";
import { renderPdfFromService } from "../../document/pdfRenderer";
import {
  buildTemplateData,
  validateRequiredFields,
} from "../../document/templateData";
import { uploadEmployeeDocumentToR2 } from "../../storage/r2";
import type { NormalizedActionConfig } from "./actionConfig";
import { getEmployeeById } from "./employee";
import { getEmployerSignatureByUserId } from "./employerSignature";
import type { Actor } from "./types";

export async function createTriggeredActionRecords(
  db: DbClient,
  employeeId: string,
  actionName: string,
  bucket?: R2Bucket,
  actor?: Actor,
  pdfRenderer?: { serviceUrl?: any | null; secret?: string | null },
  actionConfig?: NormalizedActionConfig | null,
  templateDataOverrides?: Record<string, string>,
) {
  const employee = await getEmployeeById(db, employeeId);

  if (!employee) {
    throw new Error(`Employee not found for id ${employeeId}`);
  }

  const rendererUrl = pdfRenderer?.serviceUrl?.trim();
  const hasRenderer = Boolean(rendererUrl);

  const now = new Date().toISOString();
  const normalizedAction = actionName.trim();
  const auditId = crypto.randomUUID();
  const docTemplates = actionConfig?.documents ?? [
    { id: "default", template: "default.html", order: 1 },
  ];
  const phase = actionConfig?.phase ?? "unknown";
  const recipientRoles = actionConfig?.recipients ?? [];
  const requiredEmployeeFields = actionConfig?.requiredEmployeeFields ?? [];

  // Inject employer signature as <img> tag if available
  const signatureOverrides: Record<string, string> = {};
  if (actor?.id) {
    const employerSig = await getEmployerSignatureByUserId(db, actor.id);
    if (employerSig?.signatureData) {
      const employerSignatureHtml = `<img src="${employerSig.signatureData}" style="height:40px; filter: brightness(0) saturate(100%);" />`;
      const signDate = now.slice(0, 10);

      Object.assign(signatureOverrides, {
        issuer_signature: employerSignatureHtml,
        issuer_sign_line: employerSignatureHtml,
        issuer_date: signDate,
        employer_signature: employerSignatureHtml,
        employer_sign_line: employerSignatureHtml,
        employer_sign_date: signDate,
        company_ceo_sign_line: employerSignatureHtml,
        hr_manager_signature: employerSignatureHtml,
      });
    }
  }

  const templateData = {
    ...buildTemplateData(employee, now),
    ...signatureOverrides,
    ...(templateDataOverrides ?? {}),
  };
  const { data: patchedTemplateData, incompleteFields } =
    validateRequiredFields(templateData, requiredEmployeeFields);

  const documentInserts: Array<{
    id: string;
    employeeId: string;
    action: string;
    documentName: string;
    storageUrl: string;
    createdAt: string;
  }> = [];

  for (const tmpl of docTemplates.sort((a, b) => a.order - b.order)) {
    const documentId = crypto.randomUUID();
    const orderPrefix = String(tmpl.order).padStart(2, "0");
    const generated = generateEmployeeDocument({
      employee,
      action: normalizedAction,
      generatedAt: now,
      documentId,
      templateFile: tmpl.template,
      templateData: patchedTemplateData,
    });
    let renderedPdf = hasRenderer;
    let pdfBytes: Uint8Array;
    if (hasRenderer) {
      try {
        pdfBytes = await renderPdfFromService({
          html: generated.html,
          documentName: generated.documentName,
          serviceUrl: rendererUrl,
          secret: pdfRenderer?.secret,
        });
      } catch (err) {
        console.error(`PDF render failed for ${tmpl.id}:`, err);
        renderedPdf = false;
        pdfBytes = new TextEncoder().encode(generated.html);
      }
    } else {
      pdfBytes = new TextEncoder().encode(generated.html);
    }

    let storageUrl = "";

    if (bucket) {
      try {
        const r2Key = await uploadEmployeeDocumentToR2({
          bucket,
          employeeId,
          employeeCode: employee.employeeCode,
          lastName: employee.lastName,
          firstName: employee.firstName,
          phase,
          action: normalizedAction,
          order: orderPrefix,
          templateId: tmpl.id,
          documentId,
          documentName: `${orderPrefix}_${tmpl.id}.pdf`,
          content: pdfBytes,
          contentType: renderedPdf ? "application/pdf" : "text/html",
          createdAt: now,
        });
        storageUrl = `r2://${r2Key}`;
      } catch (err) {
        console.error(`R2 upload failed for ${tmpl.id}:`, err);
        storageUrl = renderedPdf
          ? `data:application/pdf;base64,${Buffer.from(pdfBytes).toString("base64")}`
          : `data:text/html;charset=utf-8,${encodeURIComponent(generated.html)}`;
      }
    } else {
      storageUrl = renderedPdf
        ? `data:application/pdf;base64,${Buffer.from(pdfBytes).toString("base64")}`
        : `data:text/html;charset=utf-8,${encodeURIComponent(generated.html)}`;
    }

    documentInserts.push({
      id: documentId,
      employeeId,
      action: normalizedAction,
      documentName: `${orderPrefix}_${tmpl.id}.pdf`,
      storageUrl,
      createdAt: now,
    });
  }

  const batchOps = [
    ...documentInserts.map((doc) => db.insert(documents).values(doc)),
    db.insert(auditLog).values({
      id: auditId,
      employeeId,
      action: normalizedAction,
      phase,
      actorId: actor?.id ?? null,
      actorRole: actor?.role ?? "unknown",
      documentIds: JSON.stringify(documentInserts.map((doc) => doc.id)),
      recipientRoles: JSON.stringify(recipientRoles),
      recipientEmails: JSON.stringify([]),
      incompleteFields: JSON.stringify(incompleteFields),
      documentsGenerated: true,
      notificationAttempted: false,
      recipientsNotified: false,
      notificationError: null,
      timestamp: now,
    }),
  ];

  await db.batch(batchOps as [(typeof batchOps)[0], ...typeof batchOps]);

  const createdDocuments = await db
    .select()
    .from(documents)
    .where(
      and(
        eq(documents.employeeId, employeeId),
        eq(documents.action, normalizedAction),
      ),
    )
    .orderBy(documents.documentName);

  const [auditEntry] = await db
    .select()
    .from(auditLog)
    .where(and(eq(auditLog.id, auditId), eq(auditLog.employeeId, employeeId)))
    .limit(1);

  if (createdDocuments.length === 0 || !auditEntry) {
    throw new Error("Failed to create trigger action records");
  }

  return {
    employee,
    documents: createdDocuments,
    auditEntry: {
      ...auditEntry,
      documentIds: documentInserts.map((doc) => doc.id),
      recipientRoles,
      recipientEmails: [] as string[],
      incompleteFields,
    },
    incompleteFields,
  };
}
