import { z } from 'zod';

export const IsoDatetimeToDateSchema = z
  .codec(z.iso.datetime(), z.date(), {
    decode: (isoString) => new Date(isoString),
    encode: (date) => date.toISOString(),
  })
  .meta({
    description: 'ISO datetime',
    examples: ['2025-10-26T11:00:00Z'],
  });
