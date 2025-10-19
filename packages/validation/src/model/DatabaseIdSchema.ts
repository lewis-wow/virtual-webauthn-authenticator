import z from 'zod';

export const DatabaseIdSchema = z.cuid().meta({
  description: 'Unique identifier for the API key.',
  examples: ['clx3k2n6b0000v9o7f3h3b3k9'],
});
