import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/app/_components/ui/form";
import { Input } from "@/app/_components/ui/input";
import type { FieldValues } from "react-hook-form";
import type { CommonFieldProps } from "@/app/types";
import type { ChangeEvent } from "react";
import { FormLabel } from "./FormLabel";

export type NumericFieldProps<TFieldValues extends FieldValues> =
  {} & CommonFieldProps<TFieldValues>;

export const transformEventToNumberValue = (
  event: ChangeEvent<HTMLInputElement>,
) => {
  const stringValue = event.target.value;

  if (stringValue === "") {
    return undefined;
  }

  return parseFloat(stringValue);
};

export const NumericField = <TFieldValues extends FieldValues>({
  ...commonProps
}: NumericFieldProps<TFieldValues>) => {
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
          <FormControl>
            <Input
              placeholder={placeholder}
              type="number"
              required={required}
              {...field}
              onChange={(event) =>
                field.onChange(transformEventToNumberValue(event))
              }
              value={field.value ?? ""}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
