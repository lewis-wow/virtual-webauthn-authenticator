import type { WebAuthnPublicKeyCredential } from '../zod-validation/WebAuthnPublicKeyCredentialSchema';
import type { WebAuthnPublicKeyCredentialMeta } from './WebAuthnPublicKeyCredentialMeta';

export type WebAuthnPublicKeyCredentialWithMeta = WebAuthnPublicKeyCredential &
  WebAuthnPublicKeyCredentialMeta;
