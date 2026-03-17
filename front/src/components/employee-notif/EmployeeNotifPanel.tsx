import type { EmployeeNotification } from "@/lib/types";

import { EmployeeNotifRow } from "./EmployeeNotifRow";

export function EmployeeNotifPanel({
  notifications,
  selectedId,
  onSelect,
}: {
  notifications: EmployeeNotification[];
  selectedId: string | null;
  onSelect: (notification: EmployeeNotification) => void;
}) {
  return (
    <div className="flex flex-col">
      {notifications.map((item) => (
        <EmployeeNotifRow
          key={item.id}
          notification={item}
          expanded={selectedId === item.id}
          onSelect={() => {
            onSelect(item);
          }}
        />
      ))}
    </div>
  );
}
