export function FilesPageHeader({
  employeeName,
}: {
  employeeName: string | null;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        marginBottom: 28,
      }}
    >
      <p
        style={{
          color: "#111827",
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          margin: 0,
        }}
      >
        Миний баримтууд
      </p>
      <p style={{ color: "#6B7280", fontSize: 16, margin: 0 }}>
        {employeeName
          ? `${employeeName} ажилтны баримтууд.`
          : "Таны бүх хөдөлмөрийн баримт бичгийг эндээс харах болон татах боломжтой."}
      </p>
    </div>
  );
}
