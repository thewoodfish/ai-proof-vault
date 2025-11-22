import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

export const PrimaryButton = ({ 
  children, 
  className, 
  isLoading, 
  disabled,
  ...props 
}: PrimaryButtonProps) => {
  return (
    <button
      className={cn(
        "px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium",
        "hover:bg-primary-hover transition-smooth",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "flex items-center justify-center gap-2",
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <div className="spinner w-5 h-5 border-2" />}
      {children}
    </button>
  );
};
