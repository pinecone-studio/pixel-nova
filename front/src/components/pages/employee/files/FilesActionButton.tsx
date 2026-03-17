"use client";

import { useState, type ReactNode } from "react";

export function FilesActionButton({
  children,
  title,
  onClick,
}: {
  children: ReactNode;
  title?: string;
  onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <span
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        color: hovered ? "rgba(148,163,184,0.85)" : "rgba(148,163,184,0.4)",
        cursor: "pointer",
        transition: "color 0.12s",
        display: "flex",
      }}
    >
      {children}
    </span>
  );
}
