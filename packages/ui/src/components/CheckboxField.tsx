import { FormLabel } from '@repo/ui/components/FormLabel';
import { Checkbox } from '@repo/ui/components/ui/checkbox';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from '@repo/ui/components/ui/form';
import type { CommonFieldProps } from '@repo/ui/types';
import { useFormContext } from 'react-hook-form';

export type CheckboxFieldProps = {
  // Add an optional value prop to identify this item
  value?: string | number;
} & CommonFieldProps;

export const CheckboxField = ({ ...commonProps }: CheckboxFieldProps) => {
  const form = useFormContext();

  const {
    name,
    label,
    hint,
    description,
    required,
    value: itemValue,
  } = commonProps;

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
                className="cursor-pointer"
                aria-describedby={
                  description ? `${String(name)}-description` : undefined
                }
                // 1. Determine Checked State
                checked={
                  itemValue
                    ? field.value?.includes(itemValue) // Array Mode: Is item in array?
                    : field.value // Boolean Mode: Is true?
                }
                // 2. Handle Push/Pop Logic
                onCheckedChange={(checked) => {
                  if (itemValue) {
                    // --- ARRAY MODE ---
                    const currentValues = Array.isArray(field.value)
                      ? field.value
                      : [];

                    if (checked) {
                      // Push
                      field.onChange([...currentValues, itemValue]);
                    } else {
                      // Pop (Filter)
                      field.onChange(
                        currentValues.filter((v) => v !== itemValue),
                      );
                    }
                  } else {
                    // --- BOOLEAN MODE ---
                    field.onChange(checked);
                  }
                }}
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
