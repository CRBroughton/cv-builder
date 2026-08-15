import type { InputHTMLAttributes } from "react";
import { cn } from "./cn.js";
import "./Input.css";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ error = false, className, ...props }: InputProps) {
  return (
    <input
      {...props}
      aria-invalid={error ? true : undefined}
      className={cn("cv-input", error && "cv-input--error", className)}
    />
  );
}