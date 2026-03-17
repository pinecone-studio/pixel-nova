import type { EmployeeNotification } from "@/lib/types";

export function formatNotificationDate(value: string) {
  return new Date(value).toLocaleDateString("mn-MN", {
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatNotificationDateWithYear(value: string) {
  return new Date(value).toLocaleDateString("mn-MN", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  });
}

export function getNotificationInitial(notification: EmployeeNotification) {
  return notification.title.trim().charAt(0).toUpperCase() || "N";
}
