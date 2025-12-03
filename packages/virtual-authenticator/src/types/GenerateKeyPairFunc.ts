import type { PickDeep } from 'type-fest';

import type { PubKeyCredParamStrict } from '../zod-validation/PubKeyCredParamSchema';
import type { WebAuthnCredentialMeta } from './WebAuthnCredentialMeta';

export type GenerateKeyPairFunc = (args: {
  webAuthnCredentialId: string;
  pubKeyCredParams: PubKeyCredParamStrict;
}) => Promise<
  {
    COSEPublicKey: Uint8Array;
  } & PickDeep<
    WebAuthnCredentialMeta,
    | 'webAuthnCredentialKeyMetaType'
    | 'webAuthnCredentialKeyVaultKeyMeta.keyVaultKeyId'
    | 'webAuthnCredentialKeyVaultKeyMeta.keyVaultKeyName'
    | 'webAuthnCredentialKeyVaultKeyMeta.hsm'
  >
>;
