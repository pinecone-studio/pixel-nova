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
        style={{ color: "#cbd5e1", fontSize: 13, fontWeight: 500, margin: 0 }}
      >
        Бичиг Баримтууд
      </p>
      <span
        style={{
          padding: "2px 8px",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 5,
          fontSize: 11,
          color: "rgba(148,163,184,0.5)",
        }}
      >
        {count} баримт
      </span>
    </div>
  );
}
