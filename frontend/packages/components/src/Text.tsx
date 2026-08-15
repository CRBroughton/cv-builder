import type { HTMLAttributes } from "react";
import { cn } from "./cn.js";
import "./Text.css";

type TextElement = "p" | "span" | "strong" | "em" | "small" | "label";
type TextSize = "sm" | "md" | "lg";
type TextVariant = "primary" | "secondary";
type TextWeight = "regular" | "semibold";

export interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: TextElement;
  size?: TextSize;
  variant?: TextVariant;
  weight?: TextWeight;
}

export function Text({
  as: Tag = "p",
  size = "md",
  variant = "primary",
  weight = "regular",
  className,
  children,
  ...props
}: TextProps) {
  return (
    <Tag
      className={cn(
        "cv-text",
        `cv-text--${size}`,
        `cv-text--${variant}`,
        `cv-text--${weight}`,
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
