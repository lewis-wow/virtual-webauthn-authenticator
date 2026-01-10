import { HttpStatusCode } from '@repo/http';

import { WebAuthnPublicKeyCredentialBaseDtoSchema } from './components/WebAuthnPublicKeyCredentialBaseDtoSchema';
import { WebAuthnPublicKeyCredentialDtoSchema } from './components/WebAuthnPublicKeyCredentialDtoSchema';

// =============================================================================
// OPERATION: GET
// =============================================================================

export const GET_WEBAUTHN_PUBLIC_KEY_CREDENTIAL_FIELDS = {
  id: true,
} as const;

// -------------------------------------
// Inputs
// -------------------------------------

export const GetWebAuthnPublicKeyCredentialFormSchema =
  WebAuthnPublicKeyCredentialBaseDtoSchema.pick(
    GET_WEBAUTHN_PUBLIC_KEY_CREDENTIAL_FIELDS,
  );

export const GetWebAuthnPublicKeyCredentialParamsSchema =
  WebAuthnPublicKeyCredentialBaseDtoSchema.pick(
    GET_WEBAUTHN_PUBLIC_KEY_CREDENTIAL_FIELDS,
  );

// -------------------------------------
// Outputs
// -------------------------------------

export const GetWebAuthnPublicKeyCredentialResponseSchema = {
  [HttpStatusCode.OK]: WebAuthnPublicKeyCredentialDtoSchema,
};
