import type { ReactNode } from 'react';
import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';

export type CommonFieldProps<TFieldValues extends FieldValues> = {
  form: UseFormReturn<TFieldValues, unknown, FieldValues>;
  name: Path<TFieldValues>;
  label?: ReactNode;
  hint?: ReactNode;
  placeholder?: string;
  description?: ReactNode;
  required?: boolean;
  className?: string;
};
