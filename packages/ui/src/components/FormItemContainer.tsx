import {
  FormDescription,
  FormItem as FormItemUI,
  FormMessage,
} from '@repo/ui/components/ui/form';
import type { ReactNode } from 'react';

import { cn } from '../lib/utils';
import { FormLabel } from './FormLabel';

export type FormItemContainerProps = {
  label?: ReactNode;
  hint?: ReactNode;
  required?: boolean;
  description?: ReactNode;
  className?: string;
  children?: ReactNode;
};

export const FormItemContainer = ({
  label,
  hint,
  required,
  description,
  className,
  children,
}: FormItemContainerProps) => {
  return (
    <FormItemUI className={cn('w-full', className)}>
      {(!!label || !!hint || !!required) && (
        <FormLabel
          className="cursor-pointer"
          label={label}
          hint={hint}
          required={required}
        />
      )}
      {children}
      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage />
    </FormItemUI>
  );
};
