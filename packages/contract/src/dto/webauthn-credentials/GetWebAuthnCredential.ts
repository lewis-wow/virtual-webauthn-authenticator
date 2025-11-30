import { WebAuthnCredentialBaseDtoSchema } from './components/WebAuthnCredentialBaseDtoSchema';
import { WebAuthnCredentialDtoSchema } from './components/WebAuthnCredentialDtoSchema';

// =============================================================================
// OPERATION: GET
// =============================================================================

export const GET_WEBAUTHN_CREDENTIAL_FIELDS = {
  id: true,
} as const;

// -------------------------------------
// Inputs
// -------------------------------------

export const GetWebAuthnCredentialFormSchema =
  WebAuthnCredentialBaseDtoSchema.pick(GET_WEBAUTHN_CREDENTIAL_FIELDS);

export const GetWebAuthnCredentialParamsSchema =
  WebAuthnCredentialBaseDtoSchema.pick(GET_WEBAUTHN_CREDENTIAL_FIELDS);

// -------------------------------------
// Outputs
// -------------------------------------

export const GetWebAuthnCredentialResponseSchema = WebAuthnCredentialDtoSchema;
