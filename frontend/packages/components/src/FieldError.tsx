import type { HTMLAttributes } from "react";
import { cn } from "./cn.js";
import "./FieldError.css";

export interface FieldErrorProps extends HTMLAttributes<HTMLSpanElement> {}

export function FieldError({ className, children, ...props }: FieldErrorProps) {
  return (
    <span {...props} role="alert" className={cn("cv-field-error", className)}>
      {children}
    </span>
  );
}
