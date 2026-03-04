import { DateSchemaCodec } from '@repo/core/zod-validation';
import { VirtualAuthenticatorUserVerificationTypeSchema } from '@repo/virtual-authenticator/validation';
import z from 'zod';

export const VirtualAuthenticatorDtoSchema = z
  .object({
    id: z.uuid(),
    userVerificationType: VirtualAuthenticatorUserVerificationTypeSchema,
    createdAt: DateSchemaCodec,
    updatedAt: DateSchemaCodec,
  })
  .meta({
    id: 'VirtualAuthenticator',
    title: 'VirtualAuthenticator',
  });
