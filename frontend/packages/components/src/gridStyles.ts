import type { CSSProperties } from "react";

type SpaceScale = 1 | 2 | 3 | 4 | 5 | 6;

export interface GridStylesOptions {
  cols?: number | string;
  gap?: SpaceScale;
  rowGap?: SpaceScale;
  colGap?: SpaceScale;
  align?: CSSProperties["alignItems"];
  justify?: CSSProperties["justifyItems"];
}

export function gridStyles({
  cols = 1,
  gap,
  rowGap,
  colGap,
  align,
  justify,
}: GridStylesOptions = {}): { style: CSSProperties } {
  const template = typeof cols === "number" ? `repeat(${cols}, 1fr)` : cols;

  return {
    style: {
      display: "grid",
      gridTemplateColumns: template,
      ...(gap !== undefined && { gap: `var(--cv-space-${gap})` }),
      ...(rowGap !== undefined && { rowGap: `var(--cv-space-${rowGap})` }),
      ...(colGap !== undefined && { columnGap: `var(--cv-space-${colGap})` }),
      ...(align !== undefined && { alignItems: align }),
      ...(justify !== undefined && { justifyItems: justify }),
    },
  };
}
