import qs, { type IStringifyOptions } from 'qs';
import { z } from 'zod';

// Make sure you have 'qs' and '@types/qs' installed

export const QuerySchema = <T extends z.ZodType>(
  out: T, // The inner schema that validates the object
  options?: IStringifyOptions, // Optional: allow passing qs options
) =>
  z.codec(z.string().or(z.record(z.string(), z.string())), out, {
    /**
     * encode: Takes the "inner" type's INPUT
     * and turns it into the "outer" type's INPUT.
     *
     * The error message says Zod expects a function compatible with:
     * (value: z.input<T>, ...) => string
     *
     * We change 'z.output<T>' to 'z.input<T>' to match.
     */
    encode: (value: z.input<T>): string => {
      // 'value' is the raw input for your 'out' schema
      // e.g., { page: "2", tags: ["a", "b"] }
      return qs.stringify(value, options);
    },

    /**
     * decode: Takes the "outer" type's OUTPUT
     * and turns it into the "inner" type's INPUT.
     *
     * (This was already correct)
     */
    decode: (value: string | Record<string, string>): z.input<T> => {
      // 'value' is a string (output of z.string())
      // We must return z.input<T> (the raw input for 'out')
      return qs.parse(value) as z.input<T>;
    },
  });
