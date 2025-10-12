import type { FieldValues, Path, PathValue } from 'react-hook-form';
import type { CommonFieldProps } from '@/types';
import {
  FormField,
  FormItem,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { ChevronsUpDown, Check } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { FormLabel } from './FormLabel';

export type ComboboxFieldItem = {
  value: string;
  label: string;
};

export type ComboboxFieldProps<TFieldValues extends FieldValues> = {
  items: ComboboxFieldItem[];
  triggerLabel?: string;
} & CommonFieldProps<TFieldValues>;

const customFilter = (value: string, search: string) => {
  // Normalize both strings to remove diacritics and convert to lower case
  const normalizedValue = value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const normalizedSearch = search
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  // Return 1 for a match, 0 for no match
  return normalizedValue.includes(normalizedSearch) ? 1 : 0;
};

export const ComboboxField = <TFieldValues extends FieldValues>({
  items,
  triggerLabel,
  ...commonProps
}: ComboboxFieldProps<TFieldValues>) => {
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
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    'w-full justify-between',
                    !field.value && 'text-muted-foreground',
                  )}
                >
                  {field.value
                    ? items.find((item) => item.value === field.value)?.label
                    : triggerLabel}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              {/* Add the filter prop to the Command component */}
              <Command filter={customFilter}>
                <CommandInput placeholder={placeholder} className="h-9" />
                <CommandList>
                  <CommandEmpty>Nenalezeno.</CommandEmpty>
                  <CommandGroup>
                    {items.map((item) => (
                      <CommandItem
                        value={item.label}
                        key={item.value}
                        onSelect={() => {
                          form.setValue(
                            name,
                            item.value as PathValue<
                              TFieldValues,
                              Path<TFieldValues>
                            >,
                          );
                        }}
                      >
                        {item.label}
                        <Check
                          className={cn(
                            'ml-auto',
                            item.value === field.value
                              ? 'opacity-100'
                              : 'opacity-0',
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
