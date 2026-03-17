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
}: {
  open: boolean;
  loading: boolean;
  notifications: EmployeeNotification[];
  selectedId: string | null;
  onOpenChange: (open: boolean) => void;
  onSelect: (notification: EmployeeNotification) => void;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="top-7 right-0 left-auto flex h-[calc(100vh-52px)] w-[min(520px,100vw)] max-w-[min(520px,100vw)] translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none rounded-l-[28px] border-l border-[#223244] bg-[#050A11] p-0 text-white shadow-[0_24px_70px_rgba(0,0,0,0.42)] data-open:slide-in-from-right data-closed:slide-out-to-right sm:max-w-130"
      >
        <DialogHeader className="shrink-0 border-b border-[#182433] bg-[#050A11]/95 px-7 pb-3 pt-0.5 backdrop-blur-md">
          <DialogTitle className="text-[27px] font-semibold leading-none tracking-[-0.03em] text-white">
            Мэдэгдэл
          </DialogTitle>
        </DialogHeader>

        <div className="scrollbar-slim min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-5 pt-0">
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-[#718099]">
              Уншиж байна...
            </div>
          ) : notifications.length === 0 ? (
            <EmployeeNotifEmptyState />
          ) : (
            <EmployeeNotifPanel
              notifications={notifications}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
