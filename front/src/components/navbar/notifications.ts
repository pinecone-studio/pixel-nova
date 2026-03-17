export type EmployeeNotification = {
  id: string;
  title: string;
  summary: string;
  content: string;
  timeLabel: string;
  unread?: boolean;
};

export const EMPLOYEE_NOTIFICATIONS: EmployeeNotification[] = [
  {
    id: "notif-contract",
    title: "Хөдөлмөрийн гэрээ",
    summary: "Таны хөдөлмөрийн гэрээ 5 хоногийн дараа дуусна.",
    content:
      "Таны хөдөлмөрийн гэрээ 5 хоногийн дараа дуусна.\nГэрээгээ сунгана уу...",
    timeLabel: "Одоо",
    unread: true,
  },
  {
    id: "notif-profile",
    title: "Хөдөлмөрийн гэрээ",
    summary: "Таны хөдөлмөрийн гэрээ 5 хоногийн дараа дуусна.",
    content:
      "Таны хөдөлмөрийн гэрээ 5 хоногийн дараа дуусна.\nГэрээгээ сунгана уу...",
    timeLabel: "5 минутын өмнө",
  },
  {
    id: "notif-doc",
    title: "Хөдөлмөрийн гэрээ",
    summary: "Таны хөдөлмөрийн гэрээ 5 хоногийн дараа дуусна.",
    content:
      "Таны хөдөлмөрийн гэрээ 5 хоногийн дараа дуусна.\nГэрээгээ сунгана уу...",
    timeLabel: "Өчигдөр",
    unread: true,
  },
  {
    id: "notif-status",
    title: "Хөдөлмөрийн гэрээ",
    summary: "Таны хөдөлмөрийн гэрээ 5 хоногийн дараа дуусна.",
    content:
      "Таны хөдөлмөрийн гэрээ 5 хоногийн дараа дуусна.\nГэрээгээ сунгана уу...",
    timeLabel: "2 хоногийн өмнө",
  },
  {
    id: "notif-contract-last",
    title: "Хөдөлмөрийн гэрээ",
    summary: "Таны хөдөлмөрийн гэрээ 5 хоногийн дараа дуусна.",
    content:
      "Таны хөдөлмөрийн гэрээ 5 хоногийн дараа дуусна.\nГэрээгээ сунгана уу...",
    timeLabel: "3 хоногийн өмнө",
  },
];
