import { z } from 'zod';

export const IsoDatetimeToDateSchema = z
  .codec(z.iso.datetime().or(z.date()), z.date(), {
    decode: (isoString) => new Date(isoString),
    encode: (date) => date.toISOString(),
  })
  .meta({
    ref: 'IsoDatetime',
    description: 'ISO datetime',
    examples: ['2025-10-26T11:00:00Z'],
  });
