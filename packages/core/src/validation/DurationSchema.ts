import { Schema } from 'effect';

// Must be a number, an integer, and non-negative (no -30 days)
const TimeUnit = Schema.Number.pipe(Schema.int(), Schema.nonNegative());

export const DurationSchema = Schema.Struct({
  years: Schema.optional(TimeUnit),
  months: Schema.optional(TimeUnit),
  weeks: Schema.optional(TimeUnit),
  days: Schema.optional(TimeUnit),
  hours: Schema.optional(TimeUnit),
  minutes: Schema.optional(TimeUnit),
  seconds: Schema.optional(TimeUnit),
});

export type Duration = Schema.Schema.Type<typeof DurationSchema>;
