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
          color: "#fff",
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: "-0.3px",
          margin: 0,
        }}
      >
        Миний баримтууд
      </p>
      <p style={{ color: "rgba(148,163,184,0.6)", fontSize: 13, margin: 0 }}>
        {employeeName
          ? `${employeeName} ажилтны баримтууд.`
          : "Таны бүх хөдөлмөрийн баримт бичгийг эндээс харах болон татах боломжтой."}
      </p>
    </div>
  );
}
