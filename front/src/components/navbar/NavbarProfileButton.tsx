import { DownIcon } from "@/components/icons";

export function NavbarProfileButton({
  avatarLetter,
  displayName,
}: {
  avatarLetter: string;
  displayName: string;
}) {
  return (
    <button className="group flex cursor-pointer items-center gap-2 px-3 py-1.5 transition-all duration-200 hover:border-[#00CC99]/30">
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br from-[#00CC99] to-[#007A5E] text-xs font-bold text-white shadow-sm">
        {avatarLetter}
      </div>
      <span className="text-sm font-medium text-white">{displayName}</span>
      <DownIcon />
    </button>
  );
}
