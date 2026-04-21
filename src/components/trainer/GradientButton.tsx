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
  const base = "inline-flex items-center justify-center gap-2 font-semibold tracking-wide rounded-xl transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";
  const sizes = { sm: "h-9 px-3 text-xs", md: "h-11 px-5 text-sm", lg: "h-[52px] px-6 text-[15px]" };
  const variants = {
    solid: "bg-gradient-brand text-primary-foreground shadow-pink hover:shadow-pink-lg hover:-translate-y-0.5",
    outline: "border-2 border-primary text-primary hover:bg-primary-soft",
    "ghost-light": "border-2 border-white/30 text-white hover:bg-white/10",
    ghost: "text-muted-foreground hover:text-foreground hover:bg-white/5",
  };
  return (
    <button className={cn(base, sizes[size], variants[variant], className)} {...props}>
      {children}
    </button>
  );
}