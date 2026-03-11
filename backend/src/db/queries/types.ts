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
  triggerFields: string[];
}
