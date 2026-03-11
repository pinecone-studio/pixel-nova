import {
  ensureDefaultActionConfigs,
  getDocumentById,
  getDocuments,
  getAuditLogs,
  listActionConfigs,
} from "../db/queries";
import type { GraphQLContext } from "./schema";

type Ctx = GraphQLContext;

interface DocumentsArgs {
  employeeId: string;
}

interface AuditLogsArgs {
  employeeId?: string | null;
}

function parseDataUrl(dataUrl: string) {
  const [header, payload = ""] = dataUrl.split(",", 2);
  const contentType = header.slice(5).split(";")[0] || "text/plain";
  const isBase64 = header.includes(";base64");

  return {
    contentType,
    content: isBase64 ? payload : decodeURIComponent(payload),
  };
}

export const queryResolvers = {
  documents: (_: unknown, args: DocumentsArgs, ctx: Ctx) =>
    getDocuments(ctx.db, args.employeeId),

  auditLogs: (_: unknown, args: AuditLogsArgs, ctx: Ctx) =>
    getAuditLogs(ctx.db, args.employeeId),

  actions: async (_: unknown, __: unknown, ctx: Ctx) => {
    await ensureDefaultActionConfigs(ctx.db);
    return listActionConfigs(ctx.db);
  },

  documentContent: async (
    _: unknown,
    args: { documentId: string },
    ctx: Ctx,
  ) => {
    const doc = await getDocumentById(ctx.db, args.documentId);
    if (!doc) return null;

    const bucket = (ctx.env as CloudflareBindings & { epas_documents?: R2Bucket })
      .epas_documents;

    if (doc.storageUrl.startsWith("r2://") && bucket) {
      const r2Key = doc.storageUrl.replace("r2://", "");
      const r2Object = await bucket.get(r2Key);
      if (r2Object) {
        const contentType = r2Object.httpMetadata?.contentType ?? "application/pdf";
        const content = contentType === "application/pdf"
          ? Buffer.from(await r2Object.arrayBuffer()).toString("base64")
          : await r2Object.text();
        return {
          id: doc.id,
          documentName: doc.documentName,
          contentType,
          content,
        };
      }
    }

    if (doc.storageUrl.startsWith("data:")) {
      const parsed = parseDataUrl(doc.storageUrl);
      return {
        id: doc.id,
        documentName: doc.documentName,
        contentType: parsed.contentType,
        content: parsed.content,
      };
    }

    return null;
  },
};
