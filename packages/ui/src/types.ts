import type { ReactNode } from 'react';

export type CommonFieldProps = {
  name: string;
  label?: ReactNode;
  hint?: ReactNode;
  placeholder?: string;
  description?: ReactNode;
  required?: boolean;
  className?: string;
};
