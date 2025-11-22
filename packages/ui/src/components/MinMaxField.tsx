import { FormLabel } from '@repo/ui/components/FormLabel';
import { FormDescription, FormItem } from '@repo/ui/components/ui/form';
import { cn } from '@repo/ui/lib/utils';
import type { CommonFieldProps } from '@repo/ui/types';
import type { ComponentType, ReactNode } from 'react';
import type { FieldValues, Path } from 'react-hook-form';

/**
 * Props for the FieldComponent that MinMaxField will render.
 * It's essentially the CommonFieldProps but allows for any additional props.
 */
type MinMaxChildFieldProps<TFieldValues extends FieldValues> =
  CommonFieldProps<TFieldValues>;

/**
 * Props for the MinMaxField component.
 * It omits the standard 'placeholder' in favor of 'minPlaceholder' and 'maxPlaceholder'.
 */
export type MinMaxFieldProps<TFieldValues extends FieldValues> = Omit<
  CommonFieldProps<TFieldValues>,
  'placeholder'
> & {
  /** The field component to render for the min and max inputs (e.g., NumericField). */
  FieldComponent: ComponentType<MinMaxChildFieldProps<TFieldValues>>;
  placeholder?: {
    min?: string;
    max?: string;
  };
  prefix?: ReactNode;
  suffix?: ReactNode;
  /** Any other props will be passed down to the child FieldComponent. */
};

/**
 * A generic component to render a min/max field pair.
 * It automatically appends '.min' and '.max' to the provided 'name' prop.
 */
export const MinMaxField = <TFieldValues extends FieldValues>({
  // Destructure the known props from CommonFieldProps
  form,
  name,
  label,
  hint,
  description,
  required,
  // Destructure the specific props for this component
  FieldComponent,
  placeholder,
  className,
  prefix,
  suffix,
  // Capture any other props to pass down to the child component
  ...rest
}: MinMaxFieldProps<TFieldValues>) => {
  // Automatically generate the names for the min and max fields
  const minName = `${name}.min` as Path<TFieldValues>;
  const maxName = `${name}.max` as Path<TFieldValues>;

  // Prepare a common set of props for the child FieldComponent.
  // We pass down the form instance, required status, and any extra props.
  // The label, hint, and description are handled by this container component,
  // so we explicitly set them to undefined for the children to avoid duplication.
  const childFieldProps = {
    form,
    required,
    label: undefined,
    hint: undefined,
    description: undefined,
    ...rest,
  };

  return (
    <FormItem className={cn('w-full', className)}>
      {/* Render the main label and hint for the entire min/max group */}
      {(!!label || !!hint || !!required) && (
        <FormLabel label={label} hint={hint} required={required} />
      )}
      <div className="flex items-center">
        {prefix}
        <div className="flex w-full items-start space-x-2">
          <FieldComponent
            {...childFieldProps}
            name={minName}
            placeholder={placeholder?.min ?? 'Min'}
          />
          <FieldComponent
            {...childFieldProps}
            name={maxName}
            placeholder={placeholder?.max ?? 'Max'}
          />
        </div>
        {suffix}
      </div>
      {/* Render the shared description below the fields */}
      {description && <FormDescription>{description}</FormDescription>}
      {/* Note: FormMessage for each field will be rendered automatically
        within the FieldComponent itself, which is the desired behavior.
      */}
    </FormItem>
  );
};
