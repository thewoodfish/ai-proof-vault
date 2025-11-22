import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

export const LoadingSpinner = ({ message = "Loading...", className }: LoadingSpinnerProps) => {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12", className)}>
      <div className="spinner mb-4" />
      <p className="text-muted-foreground animate-pulse">{message}</p>
    </div>
  );
};
