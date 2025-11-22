import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export const Card = ({ children, className, elevated, ...props }: CardProps) => {
  return (
    <div
      className={cn(
        "bg-card rounded-2xl p-8 border border-border",
        elevated ? "card-shadow-lg" : "card-shadow",
        "transition-smooth",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
