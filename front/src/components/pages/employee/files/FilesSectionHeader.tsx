export function FilesSectionHeader({ count }: { count: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 10,
      }}
    >
      <p
        style={{ color: "#111827", fontSize: 24, fontWeight: 700, margin: 0 }}
      >
        Бичиг Баримтууд
      </p>
      <span
        style={{
          padding: "6px 14px",
          background: "white",
          border: "1px solid #E5E7EB",
          borderRadius: 999,
          fontSize: 14,
          color: "#6B7280",
        }}
      >
        {count} баримт
      </span>
    </div>
  );
}
