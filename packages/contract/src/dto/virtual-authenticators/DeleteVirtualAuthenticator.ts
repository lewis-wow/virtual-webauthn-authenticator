import { HttpStatusCode } from '@repo/http';

import { VirtualAuthenticatorDtoSchema } from './components/VirtualAuthenticatorDtoSchema';

export const DELETE_VIRTUAL_AUTHENTICATOR_FIELDS = {
  id: true,
} as const;

export const DeleteVirtualAuthenticatorParamsSchema =
  VirtualAuthenticatorDtoSchema.pick(DELETE_VIRTUAL_AUTHENTICATOR_FIELDS);

export const DeleteVirtualAuthenticatorResponseSchema = {
  [HttpStatusCode.OK_200]: VirtualAuthenticatorDtoSchema,
};
