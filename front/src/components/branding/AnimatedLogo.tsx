import { EpasLogo } from "@/components/icons";

export function AnimatedLogo({
  className = "h-28 w-28",
}: {
  className?: string;
}) {
  return <EpasLogo className={className} />;
}
