import type { WebAuthnCredential } from '../zod-validation/WebAuthnCredentialSchema';
import type { WebAuthnCredentialMeta } from './WebAuthnCredentialMeta';

export type WebAuthnCredentialWithMeta = WebAuthnCredential &
  WebAuthnCredentialMeta;
