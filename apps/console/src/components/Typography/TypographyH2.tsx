import type { ReactNode } from "react";

export type TypographyH2Props = {
  children?: ReactNode;
};

export const TypographyH2 = ({ children }: TypographyH2Props) => {
  return (
    <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
      {children}
    </h2>
  );
};
