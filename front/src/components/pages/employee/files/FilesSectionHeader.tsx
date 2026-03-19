export function FilesSectionHeader({ count }: { count: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: 24,
        marginTop: 32,
        gap: 40,
      }}
    >
      <p style={{ color: "#111827", fontSize: 24, fontWeight: 700, margin: 0 }}>
        Баримт бичиг шинэчлэлт
      </p>
      <div className="flex h-[24px] min-w-[79px] items-center rounded-sm border border-[#E5E7EB] bg-white">
        <span className="min-w-[53px] px-3 text-[12px] text-[#6B7280]">
          {count} баримт
        </span>
      </div>
    </div>
  );
}
