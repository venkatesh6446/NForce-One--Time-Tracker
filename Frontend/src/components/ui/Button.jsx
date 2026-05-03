import React from "react";
import { cn } from "../../utils/twMerge";

const Button = React.forwardRef(({ className, variant = "primary", size = "default", ...props }, ref) => {
  const variants = {
    primary: "bg-accent text-white hover:bg-accent-hover shadow-[0_0_20px_rgba(255,45,45,0.3)] hover:shadow-[0_0_30px_rgba(255,45,45,0.5)] active:scale-[0.98]",
    secondary: "bg-bg-tertiary text-text-primary border border-border-subtle hover:border-accent hover:shadow-[0_0_15px_rgba(255,45,45,0.2)] active:scale-[0.98]",
    outline: "border border-border-subtle bg-transparent text-text-primary hover:border-accent hover:text-accent hover:shadow-[0_0_15px_rgba(255,45,45,0.15)] active:scale-[0.98]",
    ghost: "bg-transparent text-text-secondary hover:bg-bg-tertiary hover:text-text-primary active:scale-[0.98]",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-[0_0_20px_rgba(220,38,38,0.3)] active:scale-[0.98]",
    success: "bg-green-600 text-white hover:bg-green-700 shadow-[0_0_20px_rgba(22,163,74,0.3)] active:scale-[0.98]",
  };

  const sizes = {
    sm: "h-8 px-3 text-sm",
    default: "h-10 px-4 py-2",
    lg: "h-12 px-8 text-lg",
    icon: "h-10 w-10",
  };

  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});

Button.displayName = "Button";

export { Button };
