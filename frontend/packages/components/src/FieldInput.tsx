import type { HTMLAttributes } from "react";
import { useId } from "react";
import { cn } from "./cn.js";
import { FieldError } from "./FieldError.js";
import { FieldLabel } from "./FieldLabel.js";
import { Input, type InputProps } from "./Input.js";
import "./FieldInput.css";

export interface FieldInputProps extends Omit<InputProps, "error"> {
  label: string;
  error?: string;
  wrapperProps?: HTMLAttributes<HTMLDivElement>;
}

export function FieldInput({
  label,
  error,
  id,
  wrapperProps,
  ...inputProps
}: FieldInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div
      {...wrapperProps}
      className={cn("cv-field-input", wrapperProps?.className)}
    >
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
      <Input
        {...inputProps}
        id={inputId}
        error={!!error}
        aria-describedby={error !== undefined ? errorId : undefined}
      />
      {error !== undefined && <FieldError id={errorId}>{error}</FieldError>}
    </div>
  );
}
