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

    // R2-оос авах
    if (doc.storageUrl.startsWith("r2://") && bucket) {
      const r2Key = doc.storageUrl.replace("r2://", "");
      const r2Object = await bucket.get(r2Key);
      if (r2Object) {
        const content = await r2Object.text();
        return {
          id: doc.id,
          documentName: doc.documentName,
          contentType: r2Object.httpMetadata?.contentType ?? "text/html",
          content,
        };
      }
    }

    // Data URL-оос авах (fallback)
    if (doc.storageUrl.startsWith("data:")) {
      const commaIdx = doc.storageUrl.indexOf(",");
      const content = decodeURIComponent(doc.storageUrl.slice(commaIdx + 1));
      const contentType = doc.storageUrl.includes("text/html") ? "text/html" : "text/plain";
      return {
        id: doc.id,
        documentName: doc.documentName,
        contentType,
        content,
      };
    }

    return null;
  },
};
