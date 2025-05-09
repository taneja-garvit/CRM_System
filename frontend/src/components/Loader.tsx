
import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: "small" | "medium" | "large";
  className?: string;
}

export default function Loader({ size = "medium", className }: LoaderProps) {
  return (
    <div 
      className={cn(
        "inline-block rounded-full border-4 border-solid border-r-transparent animate-spin",
        {
          "h-4 w-4": size === "small",
          "h-8 w-8": size === "medium",
          "h-12 w-12": size === "large",
        },
        "border-crm-purple",
        className
      )}
    />
  );
}
