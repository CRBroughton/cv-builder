import type { LabelHTMLAttributes } from "react";
import { cn } from "./cn.js";
import "./FieldLabel.css";

export interface FieldLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

export function FieldLabel({ className, children, ...props }: FieldLabelProps) {
  return (
    <label {...props} className={cn("cv-field-label", className)}>
      {children}
    </label>
  );
}
