import type { ReactNode } from 'react';
import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';

export type CommonFieldProps<TFieldValues extends FieldValues> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<TFieldValues, any, any>;
  name: Path<TFieldValues>;
  label?: ReactNode;
  hint?: ReactNode;
  placeholder?: string;
  description?: ReactNode;
  required?: boolean;
  className?: string;
};
