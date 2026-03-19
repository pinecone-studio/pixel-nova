"use client";

export const AUTH_STATE_CHANGED_EVENT = "epas-auth-state-changed";

export function notifyAuthStateChanged() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(AUTH_STATE_CHANGED_EVENT));
}
