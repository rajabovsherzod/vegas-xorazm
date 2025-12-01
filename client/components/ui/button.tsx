"use client";

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // ASOSIY STIL:
  // Ripple yo'q, lekin bosganda (active) baribir sal "ichiga kirish" (scale) effekti qoldi.
  // Bu tugmani "tirik" his qildiradi.
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-[0.95rem] font-bold tracking-wide ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        // 🔥 DEFAULT: Toza Cyan (#00B8D9).
        // Hover bo'lganda rangi o'zgarmaydi, faqat ozgina shaffoflashadi (/90).
        default: 
          "bg-[#00B8D9] text-white shadow-[0_8px_16px_0_rgba(0,184,217,0.24)] hover:bg-[#00B8D9]/90 hover:shadow-[0_12px_24px_0_rgba(0,184,217,0.3)]",
        
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        
        outline:
          "border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground",
        
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        
        ghost: "hover:bg-accent hover:text-accent-foreground",
        
        link: "text-[#00B8D9] underline-offset-4 hover:underline shadow-none",
      },
      size: {
        default: "h-12 px-6 py-3", 
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-14 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }