import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 text-slate-900 hover:shadow-lg hover:shadow-emerald-500/50 hover:scale-105",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border-2 border-white/20 bg-white/5 backdrop-blur-sm text-foreground hover:bg-white/10 hover:border-white/30",
        secondary: "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:shadow-lg hover:shadow-violet-500/50 hover:scale-105",
        ghost: "hover:bg-white/10 text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        glass: "bg-white/10 backdrop-blur-md border border-white/20 text-foreground hover:bg-white/20 hover:border-white/30",
        glow: "bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-900 shadow-lg shadow-emerald-500/50 animate-glow",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-lg",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
