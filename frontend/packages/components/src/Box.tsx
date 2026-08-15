import type { HTMLAttributes } from "react";
import { cn } from "./cn.js";
import "./Box.css";

export interface BoxProps extends HTMLAttributes<HTMLDivElement> {
  grow?: boolean;
}

export function Box({ grow = false, className, children, ...props }: BoxProps) {
  return (
    <div className={cn("cv-box", grow && "cv-box--grow", className)} {...props}>
      {children}
    </div>
  );
}
