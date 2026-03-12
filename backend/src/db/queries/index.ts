// Re-export all query modules for backward compatibility
export type {
  ActorRole,
  Actor,
  RequestContext,
  ActionRegistryInput,
} from "./types";
export type { NormalizedActionConfig } from "./actionConfig";

export {
  getEmployeeById,
  getEmployeeByCode,
  insertEmployee,
  updateEmployee,
  upsertEmployeeRecord,
} from "./employee";
export { getDocuments, getDocumentById, insertDocument } from "./document";
export {
  getAuditLogs,
  insertAuditLog,
  normalizeAuditLog,
  updateAuditLogDelivery,
} from "./auditLog";
export {
  normalizeActionConfig,
  listActionConfigs,
  ensureDefaultActionConfigs,
  upsertActionConfig,
} from "./actionConfig";
export {
  requestEmployeeOtp,
  verifyEmployeeOtp,
  createEmployeeCodeSession,
  getSessionByToken,
  deleteSessionByToken,
} from "./auth";
export { createTriggeredActionRecords } from "./triggerAction";
export {
  insertLeaveRequest,
  getLeaveRequests,
  getLeaveRequestById,
  updateLeaveRequestStatus,
} from "./leaveRequest";
