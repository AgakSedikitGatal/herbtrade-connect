import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

const toneClasses: Record<StatusTone, string> = {
  success: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
  warning: "border-amber-500/40 bg-amber-500/15 text-amber-300",
  danger: "border-red-500/40 bg-red-500/15 text-red-300",
  info: "border-blue-500/40 bg-blue-500/15 text-blue-300",
  neutral: "border-border/60 bg-muted/40 text-muted-foreground",
};

const inferTone = (value: string): StatusTone => {
  const normalized = value.toLowerCase();

  if (["verified", "clear", "low", "complete", "success", "compliant"].some((keyword) => normalized.includes(keyword))) {
    return "success";
  }

  if (["pending", "review", "medium", "draft"].some((keyword) => normalized.includes(keyword))) {
    return "warning";
  }

  if (["expired", "rejected", "flagged", "high"].some((keyword) => normalized.includes(keyword))) {
    return "danger";
  }

  if (["eudr", "fda", "jas", "blockchain"].some((keyword) => normalized.includes(keyword))) {
    return "info";
  }

  return "neutral";
};

interface ComplianceStatusBadgeProps {
  value: string;
  tone?: StatusTone;
  className?: string;
}

export const ComplianceStatusBadge = ({ value, tone, className }: ComplianceStatusBadgeProps) => {
  const selectedTone = tone ?? inferTone(value);

  return (
    <Badge variant="outline" className={cn("capitalize", toneClasses[selectedTone], className)}>
      {value.replaceAll("_", " ")}
    </Badge>
  );
};
