import type { ReactNode } from 'react';

export type TypographyH1Props = {
  children?: ReactNode;
};

export const TypographyH1 = ({ children }: TypographyH1Props) => {
  return (
    <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
      {children}
    </h1>
  );
};
