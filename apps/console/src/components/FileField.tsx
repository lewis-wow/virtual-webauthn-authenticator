import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { FieldValues } from 'react-hook-form';
import type { CommonFieldProps } from '@/app/types';
import { FormLabel } from './FormLabel';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

export type FileFieldProps<TFieldValues extends FieldValues> =
  {} & CommonFieldProps<TFieldValues>;

export const FileField = <TFieldValues extends FieldValues>({
  ...commonProps
}: FileFieldProps<TFieldValues>) => {
  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post<{ url: string }>(
        '/api/file/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total ?? 1),
            );

            console.log({ progress: percentCompleted });
          },
        },
      );

      return response.data;
    },
  });

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
              type="file"
              required={required}
              {...field}
              onChange={async (event) => {
                const result = await uploadFileMutation.mutateAsync(
                  event.target.files![0]!,
                );

                field.onChange(result.url);
              }}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
