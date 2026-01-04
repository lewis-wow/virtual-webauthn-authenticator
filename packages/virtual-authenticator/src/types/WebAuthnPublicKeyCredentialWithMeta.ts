import type { WebAuthnPublicKeyCredential } from '../validation/WebAuthnPublicKeyCredentialSchema';
import type { WebAuthnPublicKeyCredentialMeta } from './WebAuthnPublicKeyCredentialMeta';

export type WebAuthnPublicKeyCredentialWithMeta = WebAuthnPublicKeyCredential &
  WebAuthnPublicKeyCredentialMeta;
