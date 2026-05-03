import { HttpStatusCode } from '@repo/http';
import { pick } from 'lodash-es';

import { PublicKeyCredentialBaseDtoSchema } from './components/PublicKeyCredentialBaseDtoSchema';
import { PublicKeyCredentialDtoSchema } from './components/PublicKeyCredentialDtoSchema';

export const DELETE_PUBLIC_KEY_CREDENTIAL_FIELDS = {
  id: true,
} as const;

export const DeletePublicKeyCredentialFormSchema =
  PublicKeyCredentialBaseDtoSchema.pick(DELETE_PUBLIC_KEY_CREDENTIAL_FIELDS);

export const DeletePublicKeyCredentialParamsSchema =
  PublicKeyCredentialBaseDtoSchema.pick(
    pick(DELETE_PUBLIC_KEY_CREDENTIAL_FIELDS, 'id'),
  );

export const DeletePublicKeyCredentialResponseSchema = {
  [HttpStatusCode.OK_200]: PublicKeyCredentialDtoSchema,
};
