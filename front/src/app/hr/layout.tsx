import { HrAccessGate } from "@/components/hr/HrAccessGate";

export default function HrLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HrAccessGate>{children}</HrAccessGate>;
}
