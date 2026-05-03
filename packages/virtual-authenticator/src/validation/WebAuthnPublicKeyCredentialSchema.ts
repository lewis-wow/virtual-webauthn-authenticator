import z from 'zod';

import { WebAuthnPublicKeyCredentialKeyVaultSchema } from './WebAuthnPublicKeyCredentialKeyVaultSchema';

const WEB_AUTHN_PUBLIC_KEY_CREDENTIAL_VARIANTS = [
  WebAuthnPublicKeyCredentialKeyVaultSchema,
] as const;

export const WebAuthnPublicKeyCredentialSchema =
  WEB_AUTHN_PUBLIC_KEY_CREDENTIAL_VARIANTS.length === 1
    ? WEB_AUTHN_PUBLIC_KEY_CREDENTIAL_VARIANTS[0]
    : z.discriminatedUnion(
        'webAuthnPublicKeyCredentialKeyMetaType',
        WEB_AUTHN_PUBLIC_KEY_CREDENTIAL_VARIANTS,
      );

export type WebAuthnPublicKeyCredential = z.infer<
  typeof WebAuthnPublicKeyCredentialSchema
>;
