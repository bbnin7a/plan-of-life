import * as React from "react";
import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: number }
>(({ className, value, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("h-5 overflow-hidden rounded-full border-4 border-white bg-primary-light shadow-inner", className)}
    {...props}
  >
    <div
      className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
      style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
    />
  </div>
));
Progress.displayName = "Progress";

export { Progress };
