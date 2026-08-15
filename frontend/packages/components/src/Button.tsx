import type { ButtonHTMLAttributes } from "react";
import "./Button.css";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ children, type = "button", ...props }: ButtonProps) {
  return (
    <button type={type} className="cv-button" {...props}>
      {children}
    </button>
  );
}
