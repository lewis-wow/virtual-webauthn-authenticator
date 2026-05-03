import { HttpStatusCode } from '@repo/http';
import { VirtualAuthenticatorUserVerificationType } from '@repo/virtual-authenticator/enums';
import z from 'zod';

import { VirtualAuthenticatorDtoSchema } from './components/VirtualAuthenticatorDtoSchema';

export const CreateVirtualAuthenticatorBodySchema = z
  .object({
    userVerificationType: z.nativeEnum(
      VirtualAuthenticatorUserVerificationType,
    ),
    pin: z.string().min(4).optional(),
  })
  .refine(
    (data) => {
      if (
        data.userVerificationType ===
        VirtualAuthenticatorUserVerificationType.PIN
      ) {
        return data.pin !== undefined && data.pin.length >= 4;
      }
      return true;
    },
    {
      message: 'PIN is required when user verification type is PIN.',
      path: ['pin'],
    },
  );

export const CreateVirtualAuthenticatorResponseSchema = {
  [HttpStatusCode.OK_200]: VirtualAuthenticatorDtoSchema,
};
