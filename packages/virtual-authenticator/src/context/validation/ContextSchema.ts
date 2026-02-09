import z from 'zod';

import { ContextAction } from '../enums/ContextAction';
import { ContextActionSchema } from './ContextActionSchema';

export const ContextBaseSchema = z.object({
  action: ContextActionSchema,
  hash: z.string(), // hash of options and meta
  token: z.string(), // Token from previous operation
});
export type ContextBase = z.infer<typeof ContextBaseSchema>;

export const ContextUserPresenceSchema = ContextBaseSchema.extend({
  action: z.literal(ContextAction.USER_PRESENCE),
  up: z.boolean(),
});

export const ContextUserVerificationSchema = ContextBaseSchema.extend({
  action: z.literal(ContextAction.USER_VERIFICATION),
  uv: z.boolean(),
});

export const ContextCredentialSelectionSchema = ContextBaseSchema.extend({
  action: z.literal(ContextAction.CREDENTIAL_SELECTION),
  credentialId: z.string(),
});

export const ContextSchema = z.discriminatedUnion('action', [
  ContextUserPresenceSchema,
  ContextUserVerificationSchema,
  ContextCredentialSelectionSchema,
]);

export type Context = z.infer<typeof ContextSchema>;
