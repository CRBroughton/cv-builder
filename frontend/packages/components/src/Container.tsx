import type { HTMLAttributes } from "react";
import "./Container.css";

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  maxWidth?: number | string;
}

export function Container({ maxWidth = 860, style, children, ...props }: ContainerProps) {
  return (
    <div
      className="cv-container"
      style={{ maxWidth: typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth, ...style }}
      {...props}
    >
      {children}
    </div>
  );
}
