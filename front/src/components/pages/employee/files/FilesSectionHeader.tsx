export function FilesSectionHeader({ count }: { count: number }) {
  return (
    <div className="mt-8 flex h-6 items-center gap-10">
      <p
        style={{
          color: "#121316",
          fontSize: 20,
          lineHeight: "24px",
          fontWeight: 600,
          margin: 0,
        }}
      >
        Баримт бичиг шинэчлэлт
      </p>
      <div className="flex h-6 min-w-[79px] items-center rounded-[10px] border border-black/12 bg-white px-[13px] py-[3px]">
        <span className="text-[12px] font-medium leading-[18px] text-black/70">
          {count} баримт
        </span>
      </div>
    </div>
  );
}
