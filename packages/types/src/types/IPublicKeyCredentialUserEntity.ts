import type { IPublicKeyCredentialEntity } from './IPublicKeyCredentialEntity.js';

export interface IPublicKeyCredentialUserEntity
  extends IPublicKeyCredentialEntity {
  id: Buffer;
  displayName: string;
}
