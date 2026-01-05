import type { PickDeep } from 'type-fest';

import type { PubKeyCredParamStrict } from '../validation/PubKeyCredParamSchema';
import type { WebAuthnPublicKeyCredentialMeta } from './WebAuthnPublicKeyCredentialMeta';

export type GenerateKeyPairFunc = (args: {
  webAuthnPublicKeyCredentialId: string;
  pubKeyCredParams: PubKeyCredParamStrict;
}) => Promise<
  {
    COSEPublicKey: Uint8Array;
  } & PickDeep<
    WebAuthnPublicKeyCredentialMeta,
    | 'webAuthnPublicKeyCredentialKeyMetaType'
    | 'webAuthnPublicKeyCredentialKeyVaultKeyMeta.keyVaultKeyId'
    | 'webAuthnPublicKeyCredentialKeyVaultKeyMeta.keyVaultKeyName'
    | 'webAuthnPublicKeyCredentialKeyVaultKeyMeta.hsm'
  >
>;
