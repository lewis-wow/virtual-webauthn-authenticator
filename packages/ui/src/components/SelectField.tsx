import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from '@repo/ui/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/ui/select';
import type { CommonFieldProps } from '@repo/ui/types';
import type { FieldValues } from 'react-hook-form';

import { FormLabel } from './FormLabel';

export type SelectFieldItem = {
  value: string;
  label: string;
};

export type SelectFieldProps<TFieldValues extends FieldValues> = {
  items: SelectFieldItem[];
} & CommonFieldProps<TFieldValues>;

export const SelectField = <TFieldValues extends FieldValues>({
  items,
  ...commonProps
}: SelectFieldProps<TFieldValues>) => {
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
          <Select
            onValueChange={(value: string) => field.onChange(value)}
            defaultValue={field.value}
            required={required}
          >
            <FormControl>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {items.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
