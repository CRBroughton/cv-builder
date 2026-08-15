import type { CSSProperties } from "react";

type SpaceScale = 1 | 2 | 3 | 4 | 5 | 6;

export interface StackStylesOptions {
  gap?: SpaceScale;
  direction?: "row" | "column";
  align?: CSSProperties["alignItems"];
  justify?: CSSProperties["justifyContent"];
  wrap?: boolean;
}

export function stackStyles({
  gap = 2,
  direction = "column",
  align,
  justify,
  wrap = false,
}: StackStylesOptions = {}): { style: CSSProperties } {
  return {
    style: {
      display: "flex",
      flexDirection: direction,
      gap: `var(--cv-space-${gap})`,
      ...(align !== undefined && { alignItems: align }),
      ...(justify !== undefined && { justifyContent: justify }),
      ...(wrap && { flexWrap: "wrap" }),
    },
  };
}
