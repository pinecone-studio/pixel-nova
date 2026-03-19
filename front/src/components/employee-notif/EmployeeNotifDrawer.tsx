import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { EmployeeNotification } from "@/lib/types";

import { EmployeeNotifEmptyState } from "./EmployeeNotifEmptyState";
import { EmployeeNotifPanel } from "./EmployeeNotifPanel";

export function EmployeeNotifDrawer({
  open,
  loading,
  notifications,
  selectedId,
  onOpenChange,
  onSelect,
  onMarkAllRead,
  unreadCount = 0,
  theme = "light",
}: {
  open: boolean;
  loading: boolean;
  notifications: EmployeeNotification[];
  selectedId: string | null;
  onOpenChange: (open: boolean) => void;
  onSelect: (notification: EmployeeNotification) => void;
  onMarkAllRead?: () => void;
  unreadCount?: number;
  theme?: "dark" | "light";
}) {
  void theme;
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="top-7 right-0 left-auto flex h-[calc(100vh-52px)] w-[min(520px,100vw)] max-w-[min(520px,100vw)] translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none rounded-l-[28px] border-l border-[#EAECF0] bg-white p-0 text-[#101828] shadow-[-8px_0_40px_rgba(16,24,40,0.08)] data-open:slide-in-from-right data-closed:slide-out-to-right sm:max-w-130"
      >
        <DialogHeader className="shrink-0 border-b border-[#EAECF0] bg-white/95 px-7 pb-4 pt-4 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3">
            <DialogTitle className="text-[27px] font-semibold leading-none tracking-[-0.03em] text-[#101828]">
              Мэдэгдэл
            </DialogTitle>
            {onMarkAllRead ? (
              <button
                type="button"
                onClick={onMarkAllRead}
                disabled={unreadCount === 0}
                className="rounded-full border border-[#D0D5DD] px-3 py-1 text-[12px] font-medium text-[#344054] transition-colors hover:bg-[#F2F4F7] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Бүгдийг уншсан болгох
              </button>
            ) : null}
          </div>
        </DialogHeader>

        <div className="scrollbar-slim min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-5 pt-0">
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-[#667085]">
              Уншиж байна...
            </div>
          ) : notifications.length === 0 ? (
            <EmployeeNotifEmptyState theme="light" />
          ) : (
            <EmployeeNotifPanel
              notifications={notifications}
              selectedId={selectedId}
              theme="light"
              onSelect={onSelect}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
