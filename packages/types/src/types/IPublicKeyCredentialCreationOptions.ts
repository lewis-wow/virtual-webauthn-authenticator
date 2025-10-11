import type { IAuthenticatorSelectionCriteria } from './IAuthenticatorSelectionCriteria.js';
import type { IPublicKeyCredentialDescriptor } from './IPublicKeyCredentialDescriptor.js';
import type { IAuthenticationExtensionsClientInputs } from './IAuthenticationExtensionsClientInputs.js';
import type { IPublicKeyCredentialParameters } from './IPublicKeyCredentialParameters.js';
import type { IPublicKeyCredentialRpEntity } from './IPublicKeyCredentialRpEntity.js';
import type { IPublicKeyCredentialUserEntity } from './IPublicKeyCredentialUserEntity.js';
import type { Attestation } from '@repo/enums';

export interface IPublicKeyCredentialCreationOptions {
  attestation?: Attestation;
  authenticatorSelection?: IAuthenticatorSelectionCriteria;
  challenge: Buffer;
  excludeCredentials?: IPublicKeyCredentialDescriptor[];
  extensions?: IAuthenticationExtensionsClientInputs;
  pubKeyCredParams: IPublicKeyCredentialParameters[];
  rp: IPublicKeyCredentialRpEntity;
  timeout?: number;
  user: IPublicKeyCredentialUserEntity;
}
