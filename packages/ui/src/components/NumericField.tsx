import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from '@repo/ui/components/ui/form';
import { Input } from '@repo/ui/components/ui/input';
import type { CommonFieldProps } from '@repo/ui/types';
import { useFormContext } from 'react-hook-form';

import { FormLabel } from './FormLabel';

export type NumericFieldProps = {} & CommonFieldProps;

export const NumericField = ({ ...commonProps }: NumericFieldProps) => {
  const form = useFormContext();

  const { name, label, hint, placeholder, description, required } = commonProps;

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
                field.onChange(Number.parseFloat(event.target.value))
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
