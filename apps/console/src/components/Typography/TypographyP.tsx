import type { ReactNode } from "react";

export type TypographyPProps = {
  children?: ReactNode;
};

export const TypographyP = ({ children }: TypographyPProps) => {
  return <p className="leading-7 [&:not(:first-child)]:mt-6">{children}</p>;
};
