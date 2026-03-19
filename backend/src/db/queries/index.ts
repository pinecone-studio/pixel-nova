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
  updateEmployeeStatus,
  upsertEmployeeRecord,
} from "./employee";
export {
  getDocuments,
  getDocumentById,
  getDocumentsByIds,
  insertDocument,
  deleteDocument,
  updateDocumentStorage,
  updateDocumentHrSignature,
  updateDocumentEmployeeSignature,
  areAllDocumentsHrSigned,
  areAllDocumentsEmployeeSigned,
} from "./document";
export {
  getAuditLogById,
  getAuditLogByDocumentId,
  getAuditLogs,
  insertAuditLog,
  normalizeAuditLog,
  updateAuditLogDelivery,
  updateAuditLogHrSigned,
  updateAuditLogSignature,
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
export {
  insertLeaveRequest,
  getLeaveRequests,
  getLeaveRequestById,
  updateLeaveRequestStatus,
} from "./leaveRequest";
export { createTriggeredActionRecords } from "./triggerAction";
export {
  listProcessedEvents,
  getProcessedEventById,
  tryStartProcessedEvent,
  finishProcessedEvent,
} from "./eventProcessing";
export {
  insertEmployeeNotification,
  getEmployeeNotifications,
  markEmployeeNotificationRead,
  insertAnnouncementNotificationsForAudience,
} from "./employeeNotification";
export {
  listAnnouncements,
  insertAnnouncementDraft,
  updateAnnouncementDraft,
  publishAnnouncement,
} from "./announcement";
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
export {
  getEmployerSignatureByUserId,
  upsertEmployerSignature,
  verifyEmployerSignaturePasscode,
  getEmployerSignatureStatus,
} from "./employerSignature";
