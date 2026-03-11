// Re-export all query modules for backward compatibility
export type { ActorRole, Actor, RequestContext, ActionRegistryInput } from "./types";
export type { NormalizedActionConfig } from "./actionConfig";

export { getEmployeeById, getEmployeeByCode, insertEmployee, updateEmployee, upsertEmployeeRecord } from "./employee";
export { getDocuments, getDocumentById, insertDocument } from "./document";
export { getAuditLogs, insertAuditLog, updateAuditLogNotified } from "./auditLog";
export { normalizeActionConfig, listActionConfigs, ensureDefaultActionConfigs, upsertActionConfig } from "./actionConfig";
export { createTriggeredActionRecords } from "./triggerAction";
