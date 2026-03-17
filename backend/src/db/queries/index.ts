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
  listEmployees,
  insertEmployee,
  updateEmployee,
  updateEmployeeDocumentProfile,
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
  getActionConfigByName,
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
  getProcessedEventById,
  tryStartProcessedEvent,
  finishProcessedEvent,
} from "./eventProcessing";
export {
  insertEmployeeNotification,
  getEmployeeNotifications,
  markEmployeeNotificationRead,
} from "./employeeNotification";
export {
  insertContractRequest,
  getContractRequests,
  getContractRequestById,
  updateContractRequestStatus,
} from "./contractRequest";
export {
  getEmployeeSignatureByEmployeeId,
  upsertEmployeeSignature,
  verifyEmployeeSignaturePasscode,
  getEmployeeSignatureStatus,
} from "./employeeSignature";
