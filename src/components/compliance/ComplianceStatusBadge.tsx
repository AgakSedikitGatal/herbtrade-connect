import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

const toneClasses: Record<StatusTone, string> = {
  success: "border-success/40 bg-success/15 text-success",
  warning: "border-warning/40 bg-warning/15 text-warning",
  danger: "border-destructive/40 bg-destructive/15 text-destructive",
  info: "border-info/40 bg-info/15 text-info",
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
