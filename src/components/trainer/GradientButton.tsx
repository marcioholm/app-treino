'use client';
import { ButtonHTMLAttributes } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "solid" | "outline" | "ghost-light" | "ghost";
  size?: "md" | "lg" | "sm";
}

export default function GradientButton({ className, variant = "solid", size = "md", children, ...props }: Props) {
  const base = "inline-flex items-center justify-center gap-2 font-display font-bold tracking-tight rounded-xl transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none";
  
  const sizes = { 
    sm: "h-9 px-4 text-xs", 
    md: "h-11 px-6 text-sm", 
    lg: "h-[56px] px-8 text-base" 
  };
  
  const variants = {
    solid: "bg-gradient-brand text-primary-foreground shadow-pink hover:shadow-pink-lg hover:-translate-y-0.5",
    outline: "bg-white/5 border border-white/10 text-foreground hover:bg-white/10 hover:border-white/20",
    "ghost-light": "bg-white/10 border border-white/20 text-white hover:bg-white/20",
    ghost: "text-muted-foreground hover:text-foreground hover:bg-white/5",
  };

  return (
    <button className={cn(base, sizes[size], variants[variant], className)} {...props}>
      {children}
    </button>
  );
}