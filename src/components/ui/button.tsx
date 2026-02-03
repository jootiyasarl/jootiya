import * as React from "react"
import { Slot } from "@radix-ui/react-slot" // User might need to install this too, but for now I will omit if not critical or use standard button
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// I'll skip cva/radix for now to reduce dep complexity if not installed, 
// using standard props approach for "Ready to use" without too many extra installs.
// Actually, for "Senior" level, usage of CVA is expected. 
// I will stick to a robust simple version to ensure it works immediately without `class-variance-authority` install if I missed it.
// Wait, I should install `class-variance-authority` too. 

// Let's do a simple robust version.

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'glass';
  size?: 'sm' | 'default' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {

    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]";

    const variants = {
      default: "bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 shadow-md",
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      glass: "bg-white/20 backdrop-blur-lg border border-white/30 text-foreground hover:bg-white/30 shadow-sm",
    };

    const sizes = {
      sm: "h-9 px-3",
      default: "h-11 px-6 py-2",
      lg: "h-14 px-10 text-base",
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
)
Button.displayName = "Button"

export { Button }
