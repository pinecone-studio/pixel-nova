"use client";

import { useEffect, useRef, useState } from "react";
import { GrNotification } from "react-icons/gr";

import type { Employee } from "@/lib/types";

import { NotificationDetailModal } from "./NotificationDetailModal";
import { NotificationPanel } from "./NotificationPanel";
import type { EmployeeNotification } from "./notifications";

export function NavbarNotifications({
  employee,
}: {
  employee: Employee | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<EmployeeNotification | null>(null);
  const notifRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!notifRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (!isOpen) {
      return;
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      {selectedNotification ? (
        <NotificationDetailModal
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
        />
      ) : null}

      <div ref={notifRef} className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="relative flex h-9 w-9 cursor-pointer items-center justify-center text-[#6B6B8A] transition-all duration-200 hover:text-[#00CC99]"
        >
          <GrNotification className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-[#0A0A0F] bg-[#00CC99]" />
        </button>

        {isOpen && !selectedNotification ? (
          <NotificationPanel
            employee={employee}
            onSelect={(notification) => {
              setIsOpen(false);
              setSelectedNotification(notification);
            }}
          />
        ) : null}
      </div>
    </>
  );
}
