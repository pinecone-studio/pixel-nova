import type { Employee, Document } from "@/lib/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DocTreeEmployee {
  employee: Employee;
  phases: DocTreePhase[];
  documentCount: number;
}

export interface DocTreePhase {
  key: "onboarding" | "working" | "offboarding";
  label: string;
  events: DocTreeEvent[];
  documentCount: number;
}

export interface DocTreeEvent {
  date: string;
  action: string;
  label: string;
  documents: Document[];
}

export type BreadcrumbPath = {
  employeeId?: string;
  employeeName?: string;
  phase?: string;
  phaseLabel?: string;
  eventKey?: string;
  eventLabel?: string;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PHASE_ORDER: Array<"onboarding" | "working" | "offboarding"> = [
  "onboarding",
  "working",
  "offboarding",
];

const PHASE_LABELS: Record<string, string> = {
  onboarding: "Ажилд орох үе",
  working: "Ажиллах үе",
  offboarding: "Ажлаас гарах үе",
};

const ACTION_PHASE_MAP: Record<string, "onboarding" | "working" | "offboarding"> = {
  add_employee: "onboarding",
  promote_employee: "working",
  change_position: "working",
  offboard_employee: "offboarding",
};

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/**
 * Maps an action name to a lifecycle phase.
 * Falls back based on employee status when the action is not in the known map.
 */
export function actionToPhase(
  action: string,
  employeeStatus?: string,
): "onboarding" | "working" | "offboarding" {
  const mapped = ACTION_PHASE_MAP[action];
  if (mapped) return mapped;

  // Fallback: use employee status
  if (employeeStatus === "Тасалсан") return "offboarding";
  return "working";
}

/**
 * Returns the Mongolian label for a phase key.
 */
export function phaseLabel(phase: string): string {
  return PHASE_LABELS[phase] ?? phase;
}

/**
 * Returns a formatted event label: "2024-02-24 — add_employee".
 */
export function formatEventLabel(date: string, action: string): string {
  return `${date} — ${action}`;
}

/**
 * Returns the folder name for an employee: "{employeeCode}_{lastName}{firstName}".
 */
export function employeeFolderName(employee: Employee): string {
  return `${employee.employeeCode}_${employee.lastName}${employee.firstName}`;
}

// ---------------------------------------------------------------------------
// Tree builder
// ---------------------------------------------------------------------------

/**
 * Transforms a flat array of document+employee rows into a hierarchical tree
 * that mirrors the TDD storage path structure.
 *
 * HR Documents/
 * ├── {employeeCode}_{lastName}{firstName}/
 * │   ├── onboarding/
 * │   │   └── 2024-02-24_add_employee/
 * │   │       ├── 01_employment_contract.pdf
 * │   │       └── ...
 * │   ├── working/
 * │   └── offboarding/
 */
export function buildDocumentTree(
  rows: Array<{ document: Document; employee?: Employee }>,
): DocTreeEmployee[] {
  // ---- Step 1: Group documents by employeeId ----
  const employeeMap = new Map<
    string,
    { employee: Employee | undefined; documents: Document[] }
  >();

  for (const row of rows) {
    const empId = row.document.employeeId;
    let entry = employeeMap.get(empId);
    if (!entry) {
      entry = { employee: row.employee, documents: [] };
      employeeMap.set(empId, entry);
    }
    // Prefer a defined employee over undefined
    if (!entry.employee && row.employee) {
      entry.employee = row.employee;
    }
    entry.documents.push(row.document);
  }

  // ---- Step 2: Build tree for each employee ----
  const result: DocTreeEmployee[] = [];

  for (const [, { employee, documents }] of employeeMap) {
    if (!employee) continue; // skip documents with no associated employee

    // Group by phase
    const phaseGroups = new Map<
      "onboarding" | "working" | "offboarding",
      Map<string, Document[]>
    >();

    for (const doc of documents) {
      const phase = actionToPhase(doc.action, employee.status);

      if (!phaseGroups.has(phase)) {
        phaseGroups.set(phase, new Map());
      }
      const eventMap = phaseGroups.get(phase)!;

      // Event key = date portion of createdAt + action
      const date = doc.createdAt.slice(0, 10); // "2024-02-24"
      const eventKey = `${date}_${doc.action}`;

      if (!eventMap.has(eventKey)) {
        eventMap.set(eventKey, []);
      }
      eventMap.get(eventKey)!.push(doc);
    }

    // Build phases in fixed order
    const phases: DocTreePhase[] = [];

    for (const phaseKey of PHASE_ORDER) {
      const eventMap = phaseGroups.get(phaseKey);
      if (!eventMap || eventMap.size === 0) continue;

      const events: DocTreeEvent[] = [];

      for (const [eventKey, docs] of eventMap) {
        const separatorIndex = eventKey.indexOf("_");
        const date = eventKey.slice(0, separatorIndex);
        const action = eventKey.slice(separatorIndex + 1);

        // Sort documents by name
        docs.sort((a, b) => a.documentName.localeCompare(b.documentName));

        events.push({
          date,
          action,
          label: formatEventLabel(date, action),
          documents: docs,
        });
      }

      // Sort events by date descending
      events.sort((a, b) => b.date.localeCompare(a.date));

      const phaseDocCount = events.reduce(
        (sum, ev) => sum + ev.documents.length,
        0,
      );

      phases.push({
        key: phaseKey,
        label: phaseLabel(phaseKey),
        events,
        documentCount: phaseDocCount,
      });
    }

    const totalDocCount = phases.reduce(
      (sum, p) => sum + p.documentCount,
      0,
    );

    result.push({
      employee,
      phases,
      documentCount: totalDocCount,
    });
  }

  // ---- Step 3: Sort employees by code ----
  result.sort((a, b) =>
    a.employee.employeeCode.localeCompare(b.employee.employeeCode),
  );

  return result;
}
