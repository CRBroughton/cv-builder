import type { HTMLAttributes } from "react";
import type { StackStylesOptions } from "./stackStyles.js";
import { stackStyles } from "./stackStyles.js";

export interface StackProps
  extends HTMLAttributes<HTMLDivElement>,
    StackStylesOptions {}

export function Stack({
  gap,
  direction,
  align,
  justify,
  wrap,
  style,
  children,
  ...props
}: StackProps) {
  const { style: stackStyle } = stackStyles({
    ...(gap !== undefined && { gap }),
    ...(direction !== undefined && { direction }),
    ...(align !== undefined && { align }),
    ...(justify !== undefined && { justify }),
    ...(wrap !== undefined && { wrap }),
  });

  return (
    <div {...props} style={{ ...stackStyle, ...style }}>
      {children}
    </div>
  );
}
