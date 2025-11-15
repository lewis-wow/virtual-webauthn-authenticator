import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { CommonFieldProps } from '@/types';
import type { FieldValues } from 'react-hook-form';
import z from 'zod';

import { FormLabel } from './FormLabel';

export type NumericFieldProps<TFieldValues extends FieldValues> =
  {} & CommonFieldProps<TFieldValues>;

export const NumericField = <TFieldValues extends FieldValues>({
  ...commonProps
}: NumericFieldProps<TFieldValues>) => {
  const { form, name, label, hint, placeholder, description, required } =
    commonProps;

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="w-full">
          {(!!label || !!hint || !!required) && (
            <FormLabel label={label} hint={hint} required={required} />
          )}
          <FormControl>
            <Input
              placeholder={placeholder}
              type="number"
              required={required}
              {...field}
              onChange={(event) =>
                field.onChange(z.coerce.number().parse(event.target.value))
              }
              value={field.value ?? ''}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
