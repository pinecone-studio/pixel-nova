import {
  ensureDefaultActionConfigs,
  getDocumentById,
  getDocuments,
  getAuditLogs,
  getLeaveRequests,
  getContractRequests,
  getEmployeeSignatureStatus,
  getEmployeeSignatureByEmployeeId,
  getEmployerSignatureStatus,
  getEmployeeNotifications,
  listAnnouncements,
  listEmployees,
  listActionConfigs,
  listProcessedEvents,
} from "../db/queries";
import { getTemplateFileById } from "../services/contractTemplates";
import { getTemplateHtml } from "../document/generator";
import type { GraphQLContext } from "./schema";

type Ctx = GraphQLContext;

const CONTRACT_TEMPLATE_LABELS: Record<string, string> = {
  employment_contract: "Хөдөлмөрийн гэрээ",
  probation_order: "Туршилтаар авах тушаал",
  job_description: "Албан тушаалын тодорхойлолт",
  nda: "Нууцын гэрээ",
  salary_increase_order: "Цалин нэмэх тушаал",
  position_update_order: "Албан тушаал өөрчлөх тушаал",
  contract_addendum: "Гэрээний нэмэлт",
  termination_order: "Ажил дуусгавар болгох тушаал",
  handover_sheet: "Хүлээлгэн өгөх акт",
};

function formatContractTemplateLabel(id: string) {
  return CONTRACT_TEMPLATE_LABELS[id] ?? id;
}

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

  employees: (
    _: unknown,
    args: { search?: string | null; status?: string | null; department?: string | null },
    ctx: Ctx,
  ) => {
    if (ctx.actor.role !== "hr" && ctx.actor.role !== "admin") {
      throw new Error("Unauthorized");
    }

    return listEmployees(ctx.db, {
      search: args.search ?? undefined,
      status: args.status ?? undefined,
      department: args.department ?? undefined,
    });
  },

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

  contractRequests: (_: unknown, args: { status?: string | null }, ctx: Ctx) => {
    if (ctx.actor.role !== "hr" && ctx.actor.role !== "admin") {
      throw new Error("Unauthorized");
    }
    return getContractRequests(ctx.db, { status: args.status ?? undefined });
  },

  myContractRequests: (_: unknown, __: unknown, ctx: Ctx) => {
    if (ctx.actor.role !== "employee" || !ctx.actor.id) {
      throw new Error("Unauthorized");
    }
    return getContractRequests(ctx.db, { employeeId: ctx.actor.id });
  },

  mySignatureStatus: (_: unknown, __: unknown, ctx: Ctx) => {
    if (ctx.actor.role !== "employee" || !ctx.actor.id) {
      throw new Error("Unauthorized");
    }
    return getEmployeeSignatureStatus(ctx.db, ctx.actor.id);
  },

  employeeSignature: async (
    _: unknown,
    args: { employeeId: string },
    ctx: Ctx,
  ) => {
    if (ctx.actor.role !== "hr" && ctx.actor.role !== "admin") {
      throw new Error("Unauthorized");
    }
    const signature = await getEmployeeSignatureByEmployeeId(
      ctx.db,
      args.employeeId,
    );
    if (!signature?.signatureData) return null;
    return {
      employeeId: signature.employeeId,
      signatureData: signature.signatureData,
      updatedAt: signature.updatedAt ?? null,
    };
  },

  employerSignatureStatus: (_: unknown, __: unknown, ctx: Ctx) => {
    if (ctx.actor.role !== "hr" && ctx.actor.role !== "admin") {
      throw new Error("Unauthorized");
    }
    if (!ctx.actor.id) {
      throw new Error("Actor ID required");
    }
    return getEmployerSignatureStatus(ctx.db, ctx.actor.id);
  },

  myNotifications: (_: unknown, __: unknown, ctx: Ctx) => {
    if (ctx.actor.role !== "employee" || !ctx.actor.id) {
      throw new Error("Unauthorized");
    }
    return getEmployeeNotifications(ctx.db, ctx.actor.id);
  },

  announcements: (_: unknown, __: unknown, ctx: Ctx) => {
    if (ctx.actor.role !== "hr" && ctx.actor.role !== "admin") {
      throw new Error("Unauthorized");
    }
    return listAnnouncements(ctx.db);
  },

  hrNotifications: async (_: unknown, __: unknown, ctx: Ctx) => {
    if (ctx.actor.role !== "hr" && ctx.actor.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const [contracts, leaves, announcements] = await Promise.all([
      getContractRequests(ctx.db),
      getLeaveRequests(ctx.db),
      listAnnouncements(ctx.db),
    ]);

    const contractItems = contracts.map((row) => ({
      id: `contract-${row.id}`,
      title: "Гэрээний хүсэлт",
      body: [
        `${row.employee.lastName} ${row.employee.firstName}`,
        row.templateIds.map(formatContractTemplateLabel).join(", "),
        `Төлөв: ${row.status}`,
        row.note?.trim() ? `Тайлбар: ${row.note.trim()}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
      status: row.status === "pending" ? "unread" : "read",
      createdAt: row.createdAt,
      sourceType: "contract_request",
    }));

    const leaveItems = leaves.map((row) => ({
      id: `leave-${row.id}`,
      title: "Чөлөөний хүсэлт",
      body: [
        `${row.employee.lastName} ${row.employee.firstName}`,
        row.type,
        `Төлөв: ${row.status}`,
        row.reason?.trim() ? `Шалтгаан: ${row.reason.trim()}` : null,
        row.note?.trim() ? `Тайлбар: ${row.note.trim()}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
      status: row.status === "pending" ? "unread" : "read",
      createdAt: row.createdAt,
      sourceType: "leave_request",
    }));

    const announcementItems = announcements.map((row) => ({
      id: `announcement-${row.id}`,
      title: row.title,
      body: row.body,
      status: row.status === "draft" ? "unread" : "read",
      createdAt: row.publishedAt ?? row.createdAt,
      sourceType: "announcement",
    }));

    return [...contractItems, ...leaveItems, ...announcementItems].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },

  processedEvents: (
    _: unknown,
    args: { employeeId?: string | null; status?: string | null },
    ctx: Ctx,
  ) => {
    if (ctx.actor.role !== "hr" && ctx.actor.role !== "admin") {
      throw new Error("Unauthorized");
    }
    return listProcessedEvents(ctx.db, {
      employeeId: args.employeeId,
      status: args.status,
    });
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

  contractTemplate: async (
    _: unknown,
    args: { templateId: string },
    ctx: Ctx,
  ) => {
    if (ctx.actor.role !== "hr" && ctx.actor.role !== "admin") {
      throw new Error("Unauthorized");
    }
    const templateFile = getTemplateFileById(args.templateId);
    if (!templateFile) return null;
    const templateHtml = getTemplateHtml(templateFile);
    if (!templateHtml) return null;
    return {
      id: args.templateId,
      documentName: templateFile,
      contentType: "text/html",
      content: templateHtml,
    };
  },
};
