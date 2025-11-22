import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Info } from "lucide-react";

interface AlertBoxProps {
  type: "success" | "error" | "info";
  title?: string;
  message: string;
  className?: string;
}

export const AlertBox = ({ type, title, message, className }: AlertBoxProps) => {
  const styles = {
    success: {
      bg: "bg-success-light",
      border: "border-success",
      text: "text-success",
      icon: CheckCircle2,
    },
    error: {
      bg: "bg-destructive-light",
      border: "border-destructive",
      text: "text-destructive",
      icon: XCircle,
    },
    info: {
      bg: "bg-accent",
      border: "border-primary",
      text: "text-primary",
      icon: Info,
    },
  };

  const style = styles[type];
  const Icon = style.icon;

  return (
    <div
      className={cn(
        "rounded-xl p-6 border-l-4 flex items-start gap-4",
        style.bg,
        style.border,
        className
      )}
    >
      <Icon className={cn("w-6 h-6 flex-shrink-0", style.text)} />
      <div className="flex-1">
        {title && (
          <h3 className={cn("font-semibold mb-1", style.text)}>{title}</h3>
        )}
        <p className="text-foreground">{message}</p>
      </div>
    </div>
  );
};
