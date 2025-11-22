import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SecondaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export const SecondaryButton = ({ 
  children, 
  className,
  ...props 
}: SecondaryButtonProps) => {
  return (
    <button
      className={cn(
        "px-6 py-3 bg-secondary text-secondary-foreground rounded-xl font-medium",
        "hover:bg-secondary-hover transition-smooth",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
