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
        gap: 8,
      }}
    >
      <p
        style={{
          color: "#121316",
          fontSize: 28,
          lineHeight: "30px",
          fontWeight: 600,
          letterSpacing: "-0.28px",
          margin: 0,
        }}
      >
        Миний баримтууд
      </p>
      <p
        style={{
          color: "rgba(0,0,0,0.7)",
          fontSize: 16,
          lineHeight: "24px",
          letterSpacing: "-0.16px",
          margin: 0,
        }}
      >
        {employeeName
          ? `Таны бүх хөдөлмөрийн баримт бичгүүдийг энд харах болон татаж авах боломжтой.`
          : "Таны бүх хөдөлмөрийн баримт бичгийг эндээс харах болон татах боломжтой."}
      </p>
    </div>
  );
}
