import type { HTMLAttributes, KeyboardEvent } from "react";
import { cn } from "./cn.js";
import "./Card.css";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean;
};

export function Card({ interactive = false, className, onClick, children, ...props }: CardProps) {
  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (interactive && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
    }
  }

  return (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={interactive ? handleKeyDown : undefined}
      className={cn("cv-card", interactive && "cv-card--interactive", className)}
      {...props}
    >
      {children}
    </div>
  );
}
