import type { AttestationConveyancePreference } from './AttestationConveyancePreference.js';
import type { IAuthenticatorSelectionCriteria } from './IAuthenticatorSelectionCriteria.js';
import type { IPublicKeyCredentialDescriptor } from './IPublicKeyCredentialDescriptor.js';
import type { IAuthenticationExtensionsClientInputs } from './IAuthenticationExtensionsClientInputs.js';
import type { IPublicKeyCredentialParameters } from './IPublicKeyCredentialParameters.js';
import type { IPublicKeyCredentialRpEntity } from './IPublicKeyCredentialRpEntity.js';
import type { IPublicKeyCredentialUserEntity } from './IPublicKeyCredentialUserEntity.js';

export interface IPublicKeyCredentialCreationOptions {
  attestation?: AttestationConveyancePreference;
  authenticatorSelection?: IAuthenticatorSelectionCriteria;
  challenge: Buffer;
  excludeCredentials?: IPublicKeyCredentialDescriptor[];
  extensions?: IAuthenticationExtensionsClientInputs;
  pubKeyCredParams: IPublicKeyCredentialParameters[];
  rp: IPublicKeyCredentialRpEntity;
  timeout?: number;
  user: IPublicKeyCredentialUserEntity;
}
