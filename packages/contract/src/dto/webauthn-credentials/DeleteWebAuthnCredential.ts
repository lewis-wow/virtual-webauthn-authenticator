import { pick } from 'lodash-es';

import { WebAuthnCredentialBaseDtoSchema } from './components/WebAuthnCredentialBaseDtoSchema';
import { WebAuthnCredentialDtoSchema } from './components/WebAuthnCredentialDtoSchema';

export const DELETE_WEBAUTHN_CREDENTIAL_FIELDS = {
  id: true,
} as const;

// =============================================================================
// OPERATION: DELETE
// =============================================================================

// -------------------------------------
// Inputs
// -------------------------------------

export const DeleteWebAuthnCredentialFormSchema =
  WebAuthnCredentialBaseDtoSchema.pick(DELETE_WEBAUTHN_CREDENTIAL_FIELDS);

export const DeleteWebAuthnCredentialParamsSchema =
  WebAuthnCredentialBaseDtoSchema.pick(
    pick(DELETE_WEBAUTHN_CREDENTIAL_FIELDS, 'id'),
  );

// -------------------------------------
// Outputs
// -------------------------------------

export const DeleteWebAuthnCredentialResponseSchema =
  WebAuthnCredentialDtoSchema;
