import type { EmployeeNotification } from "@/lib/types";

import { EmployeeNotifRow } from "./EmployeeNotifRow";

export function EmployeeNotifPanel({
  notifications,
  selectedId,
  onSelect,
  theme = "light",
}: {
  notifications: EmployeeNotification[];
  selectedId: string | null;
  onSelect: (notification: EmployeeNotification) => void;
  theme?: "dark" | "light";
}) {
  void theme;
  return (
    <div className="flex flex-col">
      {notifications.map((item) => (
        <EmployeeNotifRow
          key={item.id}
          notification={item}
          expanded={selectedId === item.id}
          theme="light"
          onSelect={() => {
            onSelect(item);
          }}
        />
      ))}
    </div>
  );
}
