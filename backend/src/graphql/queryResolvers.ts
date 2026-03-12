import {
  ensureDefaultActionConfigs,
  getDocumentById,
  getDocuments,
  getAuditLogs,
  getLeaveRequests,
  listActionConfigs,
} from "../db/queries";
import type { GraphQLContext } from "./schema";

type Ctx = GraphQLContext;

interface DocumentsArgs {
  employeeId: string;
}

interface AuditLogsArgs {
  employeeId?: string | null;
  action?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
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

function resolveEmployeeScopedId(ctx: Ctx, requestedId?: string | null) {
  if (ctx.actor.role === "employee") {
    return ctx.actor.id;
  }

  return requestedId;
}

export const queryResolvers = {
  me: (_: unknown, __: unknown, ctx: Ctx) => ctx.currentEmployee,

  documents: (_: unknown, args: DocumentsArgs, ctx: Ctx) =>
    getDocuments(ctx.db, resolveEmployeeScopedId(ctx, args.employeeId)),

  auditLogs: (_: unknown, args: AuditLogsArgs, ctx: Ctx) =>
    getAuditLogs(ctx.db, {
      employeeId: resolveEmployeeScopedId(ctx, args.employeeId),
      action: args.action,
      fromDate: args.fromDate,
      toDate: args.toDate,
    }),

  actions: async (_: unknown, __: unknown, ctx: Ctx) => {
    await ensureDefaultActionConfigs(ctx.db);
    return listActionConfigs(ctx.db);
  },

  leaveRequests: (_: unknown, args: { status?: string | null }, ctx: Ctx) => {
    if (ctx.actor.role !== "hr" && ctx.actor.role !== "admin") {
      throw new Error("Unauthorized");
    }
    return getLeaveRequests(ctx.db, { status: args.status ?? undefined });
  },

  myLeaveRequests: (_: unknown, __: unknown, ctx: Ctx) => {
    if (ctx.actor.role !== "employee" || !ctx.actor.id) {
      throw new Error("Unauthorized");
    }
    return getLeaveRequests(ctx.db, { employeeId: ctx.actor.id });
  },

  documentContent: async (
    _: unknown,
    args: { documentId: string },
    ctx: Ctx,
  ) => {
    const doc = await getDocumentById(ctx.db, args.documentId);
    if (!doc) return null;
    if (ctx.actor.role === "employee" && doc.employeeId !== ctx.actor.id) {
      return null;
    }

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
