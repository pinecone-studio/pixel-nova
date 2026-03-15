import { HrShell } from "@/components/hr/shell";

export default function HrLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HrShell>{children}</HrShell>;
}
