import type { EmployeeNotification } from "@/lib/types";

import { EmployeeNotifRow } from "./EmployeeNotifRow";

export function EmployeeNotifPanel({
  notifications,
  selectedId,
  onSelect,
  theme = "dark",
}: {
  notifications: EmployeeNotification[];
  selectedId: string | null;
  onSelect: (notification: EmployeeNotification) => void;
  theme?: "dark" | "light";
}) {
  return (
    <div className="flex flex-col">
      {notifications.map((item) => (
        <EmployeeNotifRow
          key={item.id}
          notification={item}
          expanded={selectedId === item.id}
          theme={theme}
          onSelect={() => {
            onSelect(item);
          }}
        />
      ))}
    </div>
  );
}
