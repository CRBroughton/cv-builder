import type { HTMLAttributes } from "react";
import type { GridStylesOptions } from "./gridStyles.js";
import { gridStyles } from "./gridStyles.js";

export interface GridProps
  extends HTMLAttributes<HTMLDivElement>,
    GridStylesOptions {}

export function Grid({
  cols,
  gap,
  rowGap,
  colGap,
  align,
  justify,
  style,
  children,
  ...props
}: GridProps) {
  const { style: gridStyle } = gridStyles({
    ...(cols !== undefined && { cols }),
    ...(gap !== undefined && { gap }),
    ...(rowGap !== undefined && { rowGap }),
    ...(colGap !== undefined && { colGap }),
    ...(align !== undefined && { align }),
    ...(justify !== undefined && { justify }),
  });

  return (
    <div {...props} style={{ ...gridStyle, ...style }}>
      {children}
    </div>
  );
}
