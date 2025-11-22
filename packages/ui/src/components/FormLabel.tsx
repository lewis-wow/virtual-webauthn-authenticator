import { FormLabel as FormLabelUI } from '@repo/ui/components/ui/form';
import { cn } from '@repo/ui/lib/utils';
import type { ReactNode } from 'react';

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
