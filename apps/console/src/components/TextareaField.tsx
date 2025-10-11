import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/app/_components/ui/form";
import type { FieldValues } from "react-hook-form";
import type { CommonFieldProps } from "@/app/types";
import { Textarea } from "./ui/textarea";
import { FormLabel } from "./FormLabel";

export type TextareaFieldProps<TFieldValues extends FieldValues> =
  {} & CommonFieldProps<TFieldValues>;

export const TextareaField = <TFieldValues extends FieldValues>({
  ...commonProps
}: TextareaFieldProps<TFieldValues>) => {
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
            <Textarea
              required={required}
              placeholder={placeholder}
              className="resize-none"
              {...field}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
