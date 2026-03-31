import { DateSchemaCodec } from '@repo/core/validation';
import { VirtualAuthenticatorUserVerificationTypeSchema } from '@repo/virtual-authenticator/validation';
import z from 'zod';

export const VirtualAuthenticatorDtoSchema = z
  .object({
    id: z.uuid(),
    userVerificationType: VirtualAuthenticatorUserVerificationTypeSchema,
    isActive: z.boolean(),
    createdAt: DateSchemaCodec,
    updatedAt: DateSchemaCodec,
  })
  .meta({
    id: 'VirtualAuthenticator',
    title: 'VirtualAuthenticator',
  });
