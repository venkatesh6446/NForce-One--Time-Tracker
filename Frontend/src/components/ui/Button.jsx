import React from "react";
import { cn } from "../../utils/twMerge";

const Button = React.forwardRef(({ className, variant = "primary", size = "default", ...props }, ref) => {
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-hover shadow-sm",
    secondary: "bg-secondary text-white hover:bg-secondary-hover shadow-sm",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
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
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
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
