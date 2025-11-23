import { FormControl, FormField } from '@repo/ui/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/ui/select';
import type { CommonFieldProps } from '@repo/ui/types';
import { isEqual } from 'lodash-es';
import { useFormContext } from 'react-hook-form';

import { FormItemContainer } from './FormItemContainer';

export type SelectFieldItem<TValue> = {
  value: TValue;
  label: string;
};

export type SelectFieldProps<TValue> = {
  items: SelectFieldItem<TValue>[];
} & CommonFieldProps;

export const SelectField = <TValue,>({
  items,
  ...commonProps
}: SelectFieldProps<TValue>) => {
  const form = useFormContext();

  const { name, placeholder, ...formItemContainerProps } = commonProps;

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        // 1. THE BRIDGE (Value -> UI)
        // Find the index of the item that matches the current field value.
        // We use reference equality (===) by default, which works perfectly for class instances.
        const selectedIndex = items.findIndex((item) =>
          isEqual(item.value, field.value),
        );

        // Convert that index to a string for Shadcn/Radix ("0", "1", etc.)
        // If not found (e.g. field is null/undefined), pass undefined so placeholder shows.
        const uiValue =
          selectedIndex !== -1 ? selectedIndex.toString() : undefined;

        return (
          <FormItemContainer {...formItemContainerProps}>
            <Select
              // 2. THE BRIDGE (UI -> Value)
              // When UI changes, we get the string index ("0").
              // We parse it, look up the REAL object in the items array, and send that to the form.
              onValueChange={(valueString) => {
                const index = parseInt(valueString, 10);
                const selectedItem = items[index];

                if (selectedItem) {
                  field.onChange(selectedItem.value);
                }
              }}
              value={uiValue}
              defaultValue={uiValue}
            >
              <FormControl>
                <SelectTrigger className="w-full cursor-pointer">
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {items.map((item, index) => (
                  // 3. DUMMY VALUES
                  // We simply use the array index as the unique identifier for the UI.
                  <SelectItem
                    key={index}
                    value={index.toString()}
                    className="cursor-pointer"
                  >
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItemContainer>
        );
      }}
    />
  );
};
