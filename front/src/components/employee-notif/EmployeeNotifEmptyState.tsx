export function EmployeeNotifEmptyState({
  theme = "dark",
}: {
  theme?: "dark" | "light";
}) {
  const isLight = theme === "light";

  return (
    <div
      className={`flex h-full min-h-80 items-center justify-center rounded-[24px] border px-8 text-center text-[18px] ${
        isLight
          ? "border-[#EAECF0] bg-white text-[#667085]"
          : "border-[#223244] bg-[#0C1420] text-[#718099]"
      }`}
    >
      <div>
        <div
          className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border text-[26px] ${
            isLight
              ? "border-[#D0D5DD] bg-[#F9FAFB] text-[#98A2B3]"
              : "border-[#2A3A4B] bg-[#09111A] text-[#8A97AA]"
          }`}
        >
          !
        </div>
        Одоогоор мэдэгдэл алга байна.
      </div>
    </div>
  );
}
