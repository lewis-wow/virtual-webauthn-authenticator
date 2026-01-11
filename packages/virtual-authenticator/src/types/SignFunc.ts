import type { COSEKeyAlgorithm } from '@repo/keys/enums';
import type { Uint8Array_ } from '@repo/types';

import type { WebAuthnPublicKeyCredentialWithMeta } from './WebAuthnPublicKeyCredentialWithMeta';

export type SignFunc = (args: {
  data: Uint8Array_;
  webAuthnPublicKeyCredential: WebAuthnPublicKeyCredentialWithMeta;
}) => Promise<{ signature: Uint8Array_; alg: COSEKeyAlgorithm }>;
