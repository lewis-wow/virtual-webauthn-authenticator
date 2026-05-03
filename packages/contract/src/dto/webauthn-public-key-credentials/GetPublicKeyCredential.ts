import { HttpStatusCode } from '@repo/http';

import { PublicKeyCredentialBaseDtoSchema } from './components/PublicKeyCredentialBaseDtoSchema';
import { PublicKeyCredentialDtoSchema } from './components/PublicKeyCredentialDtoSchema';

export const GET_PUBLIC_KEY_CREDENTIAL_FIELDS = {
  id: true,
} as const;

export const GetPublicKeyCredentialFormSchema =
  PublicKeyCredentialBaseDtoSchema.pick(GET_PUBLIC_KEY_CREDENTIAL_FIELDS);

export const GetPublicKeyCredentialParamsSchema =
  PublicKeyCredentialBaseDtoSchema.pick(GET_PUBLIC_KEY_CREDENTIAL_FIELDS);

export const GetPublicKeyCredentialResponseSchema = {
  [HttpStatusCode.OK_200]: PublicKeyCredentialDtoSchema,
};
