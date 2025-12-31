import { pick } from 'lodash-es';

import { WebAuthnPublicKeyCredentialBaseDtoSchema } from './components/WebAuthnPublicKeyCredentialBaseDtoSchema';
import { WebAuthnPublicKeyCredentialDtoSchema } from './components/WebAuthnPublicKeyCredentialDtoSchema';

export const DELETE_WEBAUTHN_PUBLIC_KEY_CREDENTIAL_FIELDS = {
  id: true,
} as const;

// =============================================================================
// OPERATION: DELETE
// =============================================================================

// -------------------------------------
// Inputs
// -------------------------------------

export const DeleteWebAuthnPublicKeyCredentialFormSchema =
  WebAuthnPublicKeyCredentialBaseDtoSchema.pick(DELETE_WEBAUTHN_PUBLIC_KEY_CREDENTIAL_FIELDS);

export const DeleteWebAuthnPublicKeyCredentialParamsSchema =
  WebAuthnPublicKeyCredentialBaseDtoSchema.pick(
    pick(DELETE_WEBAUTHN_PUBLIC_KEY_CREDENTIAL_FIELDS, 'id'),
  );

// -------------------------------------
// Outputs
// -------------------------------------

export const DeleteWebAuthnPublicKeyCredentialResponseSchema =
  WebAuthnPublicKeyCredentialDtoSchema;
