import { Checkbox } from '@repo/ui/components/ui/checkbox';
import { FormControl, FormField } from '@repo/ui/components/ui/form';
import type { CommonFieldProps } from '@repo/ui/types';
import { useFormContext } from 'react-hook-form';

import { FormItemContainer } from './FormItemContainer';

export type CheckboxFieldProps = {
  value?: string | number;
} & CommonFieldProps;

export const CheckboxField = ({ ...commonProps }: CheckboxFieldProps) => {
  const form = useFormContext();

  const { name, value: itemValue, ...formItemContainerProps } = commonProps;

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        return (
          <FormItemContainer
            {...formItemContainerProps}
            className="flex cursor-pointer flex-row items-center gap-2"
          >
            <FormControl>
              <Checkbox
                className="cursor-pointer"
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
          </FormItemContainer>
        );
      }}
    />
  );
};
