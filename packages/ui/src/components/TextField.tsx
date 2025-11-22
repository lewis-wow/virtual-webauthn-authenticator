import { FormLabel } from '@repo/ui/components/FormLabel';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from '@repo/ui/components/ui/form';
import { Input } from '@repo/ui/components/ui/input';
import { cn } from '@repo/ui/lib/utils';
import type { CommonFieldProps } from '@repo/ui/types';
import type { HTMLInputAutoCompleteAttribute } from 'react';
import type { FieldValues } from 'react-hook-form';

export type TextFieldProps<TFieldValues extends FieldValues> = {
  type?: 'text' | 'email' | 'password';
  autoComplete?: HTMLInputAutoCompleteAttribute;
} & CommonFieldProps<TFieldValues>;

export const TextField = <TFieldValues extends FieldValues>({
  type = 'text',
  autoComplete,
  ...commonProps
}: TextFieldProps<TFieldValues>) => {
  const {
    form,
    name,
    label,
    hint,
    placeholder,
    description,
    required,
    className,
  } = commonProps;

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('w-full', className)}>
          {(!!label || !!hint || !!required) && (
            <FormLabel label={label} hint={hint} required={required} />
          )}
          <FormControl>
            <Input
              autoComplete={autoComplete}
              placeholder={placeholder}
              type={type}
              required={required}
              {...field}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
