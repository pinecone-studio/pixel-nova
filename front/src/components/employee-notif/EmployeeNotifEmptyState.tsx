export function EmployeeNotifEmptyState({
  theme = "light",
}: {
  theme?: "dark" | "light";
}) {
  void theme;
  return (
    <div className="flex h-full min-h-80 items-center justify-center rounded-[24px] border border-[#EAECF0] bg-white px-8 text-center text-[18px] text-[#667085]">
      <div>
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[#D0D5DD] bg-[#F9FAFB] text-[26px] text-[#98A2B3]">
          !
        </div>
        Одоогоор мэдэгдэл алга байна.
      </div>
    </div>
  );
}
