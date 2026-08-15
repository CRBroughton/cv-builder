import { Icon } from "@iconify/react";
import type { ButtonHTMLAttributes } from "react";
import "./ThemeToggle.css";

export interface ThemeToggleProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  theme: "light" | "dark" | "system";
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle, ...props }: ThemeToggleProps) {
  const isDark = theme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onToggle}
      className="cv-theme-toggle"
      {...props}
    >
      <Icon icon={isDark ? "ph:sun-bold" : "ph:moon-bold"} width={20} height={20} />
    </button>
  );
}
