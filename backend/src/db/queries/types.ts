export type ActorRole = "admin" | "hr" | "employee" | "unknown";

export interface Actor {
  id: string | null;
  role: ActorRole;
}

export interface RequestContext {
  actor: Actor;
}

export interface ActionRegistryInput {
  name: string;
  phase: string;
  triggerCondition?: string | null;
  triggerFields: string[];
  requiredEmployeeFields?: string[];
  recipients?: string[];
  documents?: Array<{
    id: string;
    template: string;
    order: number;
  }>;
}
