import { FormLabel as FormLabelUI } from '@/components/ui/form';
import type { ReactNode } from 'react';

import { cn } from '../lib/utils';

export type FormLabelProps = {
  label?: ReactNode;
  hint?: ReactNode;
  required?: boolean;
  className?: string;
};

export const FormLabel = ({
  label,
  hint,
  required,
  className,
}: FormLabelProps) => {
  return (
    <FormLabelUI>
      <div className={cn('flex justify-between', className)}>
        <span>
          {label}
          {required && <span className="text-destructive"> *</span>}
        </span>
        <span>{hint}</span>
      </div>
    </FormLabelUI>
  );
};
