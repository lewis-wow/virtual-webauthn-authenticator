'use client';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
  FormLabel as FormLabelUI,
} from '@/components/ui/form';
import type { FieldValues } from 'react-hook-form';
import type { CommonFieldProps } from '@/app/types';
import { FormLabel } from './FormLabel';

export type RadioGroupFieldItem = {
  value: string;
  label: string;
};

export type RadioGroupFieldProps<TFieldValues extends FieldValues> = {
  items: RadioGroupFieldItem[];
} & CommonFieldProps<TFieldValues>;

export const RadioGroupField = <TFieldValues extends FieldValues>({
  items,
  ...commonProps
}: RadioGroupFieldProps<TFieldValues>) => {
  const { form, name, label, hint, description, required } = commonProps;

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
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col"
              required={required}
            >
              {items.map((item) => (
                <FormItem className="flex items-center gap-3" key={item.value}>
                  <FormControl>
                    <RadioGroupItem value={item.value} />
                  </FormControl>
                  <FormLabelUI className="font-normal">
                    {item.label}
                  </FormLabelUI>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
