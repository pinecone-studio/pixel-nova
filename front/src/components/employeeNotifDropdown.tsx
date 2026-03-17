"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { useState } from "react";

import { GrNotification } from "react-icons/gr";

import { MARK_NOTIFICATION_READ } from "@/graphql/mutations";
import { GET_MY_NOTIFICATIONS } from "@/graphql/queries";
import { buildGraphQLHeaders } from "@/lib/apollo-client";
import type { EmployeeNotification } from "@/lib/types";

import { EmployeeNotifDrawer } from "./employee-notif/EmployeeNotifDrawer";
import { SAMPLE_EMPLOYEE_NOTIFICATIONS } from "./employee-notif/sampleNotifications";

const TOKEN_KEY = "epas_auth_token";

export const EmployeeNotifDropdown = () => {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mockNotifications, setMockNotifications] = useState(
    SAMPLE_EMPLOYEE_NOTIFICATIONS,
  );
  const token =
    typeof window === "undefined"
      ? ""
      : (window.localStorage.getItem(TOKEN_KEY) ?? "");

  const { data, loading, refetch } = useQuery<{
    myNotifications: EmployeeNotification[];
  }>(GET_MY_NOTIFICATIONS, {
    skip: !token,
    context: {
      headers: buildGraphQLHeaders({ authToken: token }),
    },
    fetchPolicy: "network-only",
  });

  const [markRead] = useMutation(MARK_NOTIFICATION_READ, {
    context: {
      headers: buildGraphQLHeaders({ authToken: token }),
    },
  });

  const liveNotifications = data?.myNotifications ?? [];
  const useMockNotifications = liveNotifications.length === 0;
  const notifications = useMockNotifications
    ? mockNotifications
    : liveNotifications;

  const unreadCount = notifications.filter((n) => n.status === "unread").length;

  async function handleMarkRead(id: string) {
    if (useMockNotifications) {
      setMockNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                status: "read",
                readAt: new Date().toISOString(),
              }
            : notification,
        ),
      );
      return;
    }

    await markRead({ variables: { id } });
    await refetch();
  }

  async function handleSelect(notification: EmployeeNotification) {
    const nextSelectedId =
      selectedId === notification.id ? null : notification.id;
    setSelectedId(nextSelectedId);

    if (notification.status === "unread") {
      await handleMarkRead(notification.id);
    }
  }

  return (
    <>
      <button
        onClick={() => {
          setOpen((prev) => {
            const next = !prev;
            if (!next) {
              setSelectedId(null);
            }
            return next;
          });
        }}
        className="relative flex h-9 w-9 cursor-pointer items-center justify-center text-[#000000] transition-all duration-200 hover:text-[#00CC99]"
        aria-label="Мэдэгдэл"
      >
        <GrNotification className="h-4 w-4" />
        {unreadCount > 0 ? (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#fc171b]" />
        ) : null}
      </button>

      <EmployeeNotifDrawer
        open={open}
        loading={loading}
        notifications={notifications}
        selectedId={selectedId}
        theme="light"
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            setSelectedId(null);
          }
        }}
        onSelect={(notification) => {
          void handleSelect(notification);
        }}
      />
    </>
  );
};
