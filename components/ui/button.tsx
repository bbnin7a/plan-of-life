import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full border-4 font-black transition active:translate-y-1 active:shadow-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-primary-dark bg-primary text-white shadow-[0_6px_0_#46A302] hover:bg-primary-dark",
        secondary:
          "border-border bg-white text-foreground shadow-playful hover:bg-primary-light",
        danger:
          "border-danger bg-danger text-white shadow-[0_6px_0_rgba(255,75,75,0.55)]",
      },
      size: {
        sm: "min-h-12 px-4 py-2 text-base",
        lg: "min-h-14 px-5 py-3 text-lg",
        xl: "min-h-16 px-6 py-4 text-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "lg",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
