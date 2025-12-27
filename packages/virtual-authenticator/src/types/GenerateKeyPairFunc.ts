import type { PickDeep } from 'type-fest';

import type { PubKeyCredParamStrict } from '../zod-validation/PubKeyCredParamSchema';
import type { WebAuthnCredentialMeta } from './WebAuthnPublicKeyCredentialMeta';

export type GenerateKeyPairFunc = (args: {
  webAuthnCredentialId: string;
  pubKeyCredParams: PubKeyCredParamStrict;
}) => Promise<
  {
    COSEPublicKey: Uint8Array;
  } & PickDeep<
    WebAuthnCredentialMeta,
    | 'webAuthnPublicKeyCredentialKeyMetaType'
    | 'webAuthnPublicKeyCredentialKeyVaultKeyMeta.keyVaultKeyId'
    | 'webAuthnPublicKeyCredentialKeyVaultKeyMeta.keyVaultKeyName'
    | 'webAuthnPublicKeyCredentialKeyVaultKeyMeta.hsm'
  >
>;
