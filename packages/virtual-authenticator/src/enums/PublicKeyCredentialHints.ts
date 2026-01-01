import type { ValueOfEnum } from '@repo/types';

/**
 * WebAuthn Relying Parties may use this enumeration to communicate hints to the user-agent about how a
 * request may be best completed. These hints are not requirements, and do not bind
 * the user-agent, but may guide it in providing the best experience by using
 * contextual information that the Relying Party has about the request.
 *
 * @see https://www.w3.org/TR/webauthn-3/#enum-hints
 */
export const PublicKeyCredentialHints = {
  /**
   * Indicates that the Relying Party believes that users will satisfy this request with a physical security key.
   * For example, an enterprise Relying Party may set this hint if they have issued security keys to their employees
   * and will only accept those authenticators for registration and authentication.
   */
  SECURITY_KEY: 'security-key',
  /**
   * Indicates that the Relying Party believes that users will satisfy this request with a platform authenticator
   * attached to the client device.
   */
  CLIENT_DEVICE: 'client-device',
  /**
   * Indicates that the Relying Party believes that users will satisfy this request with general-purpose
   * authenticators such as smartphones. For example, a consumer Relying Party may believe that only a small
   * fraction of their customers possesses dedicated security keys. This option also implies that the local
   * platform authenticator should not be promoted in the UI.
   */
  HYBRID: 'hybrid',
} as const;

export type PublicKeyCredentialHints = ValueOfEnum<
  typeof PublicKeyCredentialHints
>;
