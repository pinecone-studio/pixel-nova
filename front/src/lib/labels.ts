const DEPARTMENT_LABELS: Record<string, string> = {
  Engineering: "Инженерчлэл",
  HR: "Хүний нөөц",
  Sales: "Борлуулалт",
  Finance: "Санхүү",
  Marketing: "Маркетинг",
  Design: "Дизайн",
};

const LEVEL_LABELS: Record<string, string> = {
  Junior: "Анхан",
  Mid: "Дунд",
  Senior: "Ахлах",
  Lead: "Тэргүүлэх",
};

const BRANCH_LABELS: Record<string, string> = {
  Ulaanbaatar: "Улаанбаатар",
  Darkhan: "Дархан",
  Erdenet: "Эрдэнэт",
  Remote: "Алсаас",
};

export function formatDepartment(value?: string | null) {
  if (!value) return "";
  return DEPARTMENT_LABELS[value] ?? value;
}

export function formatLevel(value?: string | null) {
  if (!value) return "";
  return LEVEL_LABELS[value] ?? value;
}

export function formatBranch(value?: string | null) {
  if (!value) return "";
  return BRANCH_LABELS[value] ?? value;
}

export function formatLeaveRequestStatus(value?: string | null) {
  if (!value) return "";
  const labels: Record<string, string> = {
    pending: "Хүлээгдэж буй",
    approved: "Баталсан",
    rejected: "Татгалзсан",
  };
  return labels[value] ?? value;
}
