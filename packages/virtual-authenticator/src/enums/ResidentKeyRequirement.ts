import type { ValueOfEnum } from '@repo/types';

/**
 * This enumeration's values describe the Relying Party's requirements for
 * client-side discoverable credentials (formerly known as resident credentials or resident keys).
 * @see https://www.w3.org/TR/webauthn-3/#enum-residentKeyRequirement
 */
export const ResidentKeyRequirement = {
  /**
   * The Relying Party requires a client-side discoverable credential.
   * The client and authenticator MUST create a client-side discoverable credential.
   */
  REQUIRED: 'required',
  /**
   * The Relying Party strongly prefers creating a client-side discoverable credential,
   * but will accept a server-side credential. The client and authenticator SHOULD
   * create a discoverable credential if possible.
   */
  PREFERRED: 'preferred',
  /**
   * The Relying Party prefers creating a server-side credential, but will accept
   * a client-side discoverable credential. The client and authenticator SHOULD
   * create a server-side credential if possible.
   */
  DISCOURAGED: 'discouraged',
} as const;

export type ResidentKeyRequirement = ValueOfEnum<typeof ResidentKeyRequirement>;
