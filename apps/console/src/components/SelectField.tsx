import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { FieldValues } from 'react-hook-form';
import type { CommonFieldProps } from '@/types';
import {
  FormField,
  FormItem,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { withDefaultFieldTransform } from '@/lib/withDefaultTransform';
import { FormLabel } from './FormLabel';

export type SelectFieldItem<T> = {
  value: T;
  label: string;
};

export type SelectFieldProps<TFieldValues extends FieldValues, T> = {
  items: SelectFieldItem<T>[];
} & CommonFieldProps<TFieldValues, T>;

export const SelectField = <TFieldValues extends FieldValues, T>({
  items,
  ...commonProps
}: SelectFieldProps<TFieldValues, T>) => {
  const {
    form,
    name,
    label,
    hint,
    placeholder,
    description,
    required,
    transform,
  } = withDefaultFieldTransform(commonProps);

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
            onValueChange={(value: string) =>
              field.onChange(transform.output(value))
            }
            defaultValue={transform.input(field.value)}
            required={required}
          >
            <FormControl>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {items.map((item) => (
                <SelectItem
                  key={transform.input(item.value)}
                  value={transform.input(item.value)}
                >
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
