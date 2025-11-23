import { Button } from '@repo/ui/components/ui/button';
import { Calendar } from '@repo/ui/components/ui/calendar';
import { FormControl, FormField } from '@repo/ui/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@repo/ui/components/ui/popover';
import { cn } from '@repo/ui/lib/utils';
import type { CommonFieldProps } from '@repo/ui/types';
import { format, isBefore, startOfToday } from 'date-fns';
import { cs } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

import { FormItemContainer } from './FormItemContainer';

export type DateFieldProps = {} & CommonFieldProps;

export const DateField = ({ ...commonProps }: DateFieldProps) => {
  const form = useFormContext();

  const { name, placeholder, ...formItemContainerProps } = commonProps;

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItemContainer {...formItemContainerProps}>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-60 pl-3 text-left font-normal',
                    !field.value && 'text-muted-foreground',
                  )}
                >
                  {field.value ? (
                    format(field.value, 'PPP')
                  ) : (
                    <span>{placeholder}</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                disabled={(date: string | number | Date) =>
                  isBefore(date, startOfToday())
                }
                captionLayout="dropdown"
                locale={cs}
                weekStartsOn={1}
              />
            </PopoverContent>
          </Popover>
        </FormItemContainer>
      )}
    />
  );
};
