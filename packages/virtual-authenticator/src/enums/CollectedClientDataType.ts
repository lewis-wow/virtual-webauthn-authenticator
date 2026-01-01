import type { ValueOfEnum } from '@repo/types';

/**
 * The type of WebAuthn ceremony being performed.
 * @see https://www.w3.org/TR/webauthn-3/#dom-collectedclientdata-type
 */
export const CollectedClientDataType = {
  /**
   * Indicates that this is a registration (credential creation) ceremony.
   */
  WEBAUTHN_CREATE: 'webauthn.create',
  /**
   * Indicates that this is an authentication (assertion) ceremony.
   */
  WEBAUTHN_GET: 'webauthn.get',
} as const;

export type CollectedClientDataType = ValueOfEnum<
  typeof CollectedClientDataType
>;
