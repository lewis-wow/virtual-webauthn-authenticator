import type { COSEKeyAlgorithm } from '@repo/keys/enums';

import type { WebAuthnCredentialWithMeta } from './WebAuthnCredentialWithMeta';

export type SignFunc = (args: {
  data: Uint8Array;
  webAuthnCredential: WebAuthnCredentialWithMeta;
}) => Promise<{ signature: Uint8Array; alg: COSEKeyAlgorithm }>;
