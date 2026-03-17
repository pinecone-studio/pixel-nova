export type HrNotifItem = {
  id: string;
  title: string;
  body: string;
  status: "pending" | "approved" | "rejected";
  date: string;
  audience: string;
  employeeName: string;
};
