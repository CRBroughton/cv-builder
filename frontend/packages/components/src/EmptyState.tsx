import type { HTMLAttributes } from "react";
import "./EmptyState.css";

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {}

export function EmptyState({ children, ...props }: EmptyStateProps) {
  return (
    <div className="cv-empty-state" {...props}>
      {children}
    </div>
  );
}
