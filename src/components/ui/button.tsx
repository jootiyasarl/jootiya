import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'glass';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {

    const baseStyles = "inline-flex items-center justify-center rounded-2xl text-sm font-black uppercase tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-[1.02] active:scale-[0.96] select-none cursor-pointer whitespace-normal sm:whitespace-nowrap text-center";

    const variants = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline",
      glass: "bg-white/20 backdrop-blur-lg border border-white/30 text-foreground hover:bg-white/30 shadow-sm",
    };

    const sizes = {
      default: "h-11 px-6 py-2",
      sm: "h-9 rounded-xl px-3",
      lg: "h-14 rounded-2xl px-10 text-base",
      icon: "h-10 w-10",
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
