import type { WebAuthnCredential } from '../validation/WebAuthnCredentialSchema';
import type { WebAuthnCredentialMeta } from './WebAuthnCredentialMeta';

export type WebAuthnCredentialWithMeta = WebAuthnCredential &
  WebAuthnCredentialMeta;
