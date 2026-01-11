import type { Uint8Array_ } from '@repo/types';
import type { PickDeep } from 'type-fest';

import type { PubKeyCredParamStrict } from '../validation/spec/PubKeyCredParamSchema';
import type { WebAuthnPublicKeyCredentialMeta } from './WebAuthnPublicKeyCredentialMeta';

export type GenerateKeyPairFunc = (args: {
  webAuthnPublicKeyCredentialId: string;
  pubKeyCredParams: PubKeyCredParamStrict;
}) => Promise<
  {
    COSEPublicKey: Uint8Array_;
  } & PickDeep<
    WebAuthnPublicKeyCredentialMeta,
    | 'webAuthnPublicKeyCredentialKeyMetaType'
    | 'webAuthnPublicKeyCredentialKeyVaultKeyMeta.keyVaultKeyId'
    | 'webAuthnPublicKeyCredentialKeyVaultKeyMeta.keyVaultKeyName'
    | 'webAuthnPublicKeyCredentialKeyVaultKeyMeta.hsm'
  >
>;
