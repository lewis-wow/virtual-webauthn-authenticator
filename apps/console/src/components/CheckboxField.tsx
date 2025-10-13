import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import type { CommonFieldProps } from '@/types';
import type { FieldValues } from 'react-hook-form';

import { FormLabel } from './FormLabel';
import { Checkbox } from './ui/checkbox';

export type CheckboxFieldProps<TFieldValues extends FieldValues> =
  {} & CommonFieldProps<TFieldValues>;

export const CheckboxField = <TFieldValues extends FieldValues>({
  ...commonProps
}: CheckboxFieldProps<TFieldValues>) => {
  const { form, name, label, hint, description, required } = commonProps;

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        return (
          <FormItem className="flex cursor-pointer flex-row items-center gap-2">
            {(!!label || !!hint || !!required) && (
              <FormLabel
                className="cursor-pointer"
                label={label}
                hint={hint}
                required={required}
              />
            )}
            <FormControl>
              <Checkbox
                required={required}
                checked={field.value}
                onCheckedChange={field.onChange}
                aria-describedby={
                  description ? `${String(name)}-description` : undefined
                }
                className="cursor-pointer"
              />
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};
