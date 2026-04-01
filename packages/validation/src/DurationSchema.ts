import { z } from 'zod';

// Must be a number, an integer, and non-negative (no -30 days)

const TimeUnit = z.int().nonnegative();

export const DurationSchema = z.object({
  years: TimeUnit.optional(),
  months: TimeUnit.optional(),
  weeks: TimeUnit.optional(),
  days: TimeUnit.optional(),
  hours: TimeUnit.optional(),
  minutes: TimeUnit.optional(),
  seconds: TimeUnit.optional(),
});

export type Duration = z.infer<typeof DurationSchema>;
