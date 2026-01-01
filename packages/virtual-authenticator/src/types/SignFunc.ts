import type { COSEKeyAlgorithm } from '@repo/keys/enums';

import type { WebAuthnPublicKeyCredentialWithMeta } from './WebAuthnPublicKeyCredentialWithMeta';

export type SignFunc = (args: {
  data: Uint8Array;
  webAuthnPublicKeyCredential: WebAuthnPublicKeyCredentialWithMeta;
}) => Promise<{ signature: Uint8Array; alg: COSEKeyAlgorithm }>;
