import { FormControl, FormField } from '@repo/ui/components/ui/form';
import { Input } from '@repo/ui/components/ui/input';
import type { CommonFieldProps } from '@repo/ui/types';
import type { HTMLInputAutoCompleteAttribute } from 'react';
import { useFormContext } from 'react-hook-form';

import { FormItemContainer } from './FormItemContainer';

export type TextFieldProps = {
  type?: 'text' | 'email' | 'password';
  autoComplete?: HTMLInputAutoCompleteAttribute;
} & CommonFieldProps;

export const TextField = ({
  type = 'text',
  autoComplete,
  ...commonProps
}: TextFieldProps) => {
  const form = useFormContext();

  const { name, placeholder, ...formItemContainerProps } = commonProps;

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItemContainer {...formItemContainerProps}>
          <FormControl>
            <Input
              autoComplete={autoComplete}
              placeholder={placeholder}
              type={type}
              {...field}
            />
          </FormControl>
        </FormItemContainer>
      )}
    />
  );
};
