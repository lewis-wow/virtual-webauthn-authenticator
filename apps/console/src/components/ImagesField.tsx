'use client';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/Button';
import { Input } from '@/components/ui/input';
import type { CommonFieldProps } from '@/types';
import { X } from 'lucide-react';
import { useState, useEffect, type ChangeEvent } from 'react';
import type { FieldValues } from 'react-hook-form';
import Image from 'next/image'; // 1. Import the Image component
import { FormLabel } from './FormLabel';

export type ImagesFieldProps<TFieldValues extends FieldValues> = {
  maxImages?: number;
} & CommonFieldProps<TFieldValues>;

export const ImagesField = <TFieldValues extends FieldValues>({
  maxImages = 3,
  ...commonProps
}: ImagesFieldProps<TFieldValues>) => {
  const { form, name, label, hint, description, required } = commonProps;

  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const watchedFiles: File[] = form.watch(name) || [];

  const fileDependencies = watchedFiles
    .map((f) => `${f.name}-${f.size}-${f.lastModified}`)
    .join(',');

  useEffect(() => {
    if (!watchedFiles || watchedFiles.length === 0) {
      if (photoPreviews.length > 0) setPhotoPreviews([]);
      return;
    }

    const newPreviews = watchedFiles.map((file) => URL.createObjectURL(file));
    setPhotoPreviews(newPreviews);

    return () => {
      newPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileDependencies]);

  // The rest of the component remains the same
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        const currentFiles: File[] = field.value || [];

        const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
          const filesFromInput = Array.from(e.target.files ?? []);
          if (!filesFromInput) return;
          const remainingSlots = maxImages - currentFiles.length;
          const filesToAdd = filesFromInput.slice(0, remainingSlots);
          if (filesToAdd.length > 0) {
            const updatedFiles = [...currentFiles, ...filesToAdd];
            field.onChange(updatedFiles);
          }
          e.target.value = '';
        };

        const removePhoto = (indexToRemove: number) => {
          const updatedFiles = currentFiles.filter(
            (_, index) => index !== indexToRemove,
          );
          field.onChange(updatedFiles);
        };

        return (
          <FormItem className="w-full">
            {(!!label || !!hint || !!required) && (
              <FormLabel label={label} hint={hint} required={required} />
            )}
            <div className="space-y-4">
              {photoPreviews.length > 0 && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {photoPreviews.map((preview, index) => (
                    <div key={preview} className="group relative aspect-square">
                      {/* 2. Replace <img> with <Image> */}
                      <Image
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="rounded-lg border object-cover"
                        fill
                        unoptimized
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => removePhoto(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              {currentFiles.length < maxImages && (
                <FormControl>
                  <Input
                    id={name}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="cursor-pointer"
                  />
                </FormControl>
              )}
            </div>
            {description && (
              <FormDescription className="pt-2">{description}</FormDescription>
            )}
            <p className="text-muted-foreground text-sm">
              Ještě je možné nahrát{' '}
              {Math.max(0, maxImages - currentFiles.length)} obrázků. (Max{' '}
              {maxImages})
            </p>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};
