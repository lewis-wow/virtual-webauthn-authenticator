import type { ReactNode } from 'react';
import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';

export type FieldTransform<T> = {
  input: (value: T | undefined) => string;
  output: (value: string) => T | undefined;
};

export type CommonFieldProps<
  TFieldValues extends FieldValues,
  TTRansform = string,
  TContext = unknown,
  TTransformedValues extends FieldValues = TFieldValues,
> = {
  form: UseFormReturn<TFieldValues, TContext, TTransformedValues>;
  name: Path<TFieldValues>;
  label?: ReactNode;
  hint?: ReactNode;
  placeholder?: string;
  description?: ReactNode;
  required?: boolean;
  transform?: FieldTransform<TTRansform>;
  className?: string;
};
