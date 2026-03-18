"use client";

export function FilesToolbar({
  search,
  filter,
  onSearchChange,
  onFilterChange,
}: {
  search: string;
  filter: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
      <div style={{ position: "relative", flex: 1 }}>
        <span
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#9CA3AF",
            pointerEvents: "none",
            display: "flex",
          }}
        >
          <svg
            width="13"
            height="13"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </span>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Баримт хайх..."
          style={{
            width: "100%",
            height: 40,
            padding: "0 12px 0 36px",
            background: "white",
            border: "1px solid #E5E7EB",
            borderRadius: 12,
            color: "#121316",
            fontSize: 14,
            outline: "none",
          }}
        />
      </div>
      <select
        value={filter}
        onChange={(event) => onFilterChange(event.target.value)}
        style={{
          height: 40,
          padding: "0 14px",
          background: "white",
          border: "1px solid #E5E7EB",
          borderRadius: 12,
          color: "#6B7280",
          fontSize: 14,
          outline: "none",
          cursor: "pointer",
        }}
      >
        <option value="all">Бүх төрөл</option>
        <option value="pdf">PDF</option>
        <option value="html">HTML</option>
        <option value="txt">TXT</option>
      </select>
    </div>
  );
}
