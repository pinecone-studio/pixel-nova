"use client";

export const HR_AUTH_STORAGE_KEY = "hr_authenticated";

export function subscribeHrAuth(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handler = () => callback();
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

export function getHrAuthSnapshot() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(HR_AUTH_STORAGE_KEY) === "true";
}
