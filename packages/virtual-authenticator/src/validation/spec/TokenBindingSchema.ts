import z from 'zod';

import { see } from '../../meta/see';
import { TokenBindingStatusSchema } from '../enums/TokenBindingStatusSchema';

/**
 * @see https://datatracker.ietf.org/doc/html/rfc8471#section-1
 */
export const TokenBindingSchema = z
  .object({
    status: TokenBindingStatusSchema,
    id: z.string().optional(),
  })
  .meta({
    description: `This OPTIONAL member contains information about the state of the Token Binding protocol used when communicating with the Relying Party. ${see(
      'https://datatracker.ietf.org/doc/html/rfc8471#section-1',
    )}`,
  });

export type TokenBinding = z.infer<typeof TokenBindingSchema>;
