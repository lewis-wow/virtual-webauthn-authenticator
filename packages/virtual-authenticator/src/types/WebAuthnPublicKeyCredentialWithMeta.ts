import type { WebAuthnCredential } from '../zod-validation/WebAuthnCredentialSchema';
import type { WebAuthnCredentialMeta } from './WebAuthnPublicKeyCredentialMeta';

export type WebAuthnPublicKeyCredentialWithMeta = WebAuthnCredential &
  WebAuthnCredentialMeta;
