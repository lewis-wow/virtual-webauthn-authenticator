import { Hash } from '@repo/crypto';
import type { Uint8Array_ } from '@repo/types';

export type CreateAuthenticatorDataArgs = {
  rpId: string;
  counter: number;
  attestedCredentialData: Uint8Array_ | undefined;
  requireUserVerification: boolean;
  userVerificationEnabled: boolean;
  userPresenceEnabled: boolean;
};

/**
 * Creates authenticator data structure with flags and counters.
 * @see https://www.w3.org/TR/webauthn-3/#sctn-authenticator-data
 */
export const createAuthenticatorData = async (
  opts: CreateAuthenticatorDataArgs,
): Promise<Uint8Array_> => {
  const {
    rpId,
    counter,
    attestedCredentialData,
    requireUserVerification,
    userVerificationEnabled,
    userPresenceEnabled,
  } = opts;

  // SHA-256 hash of the RP ID the credential is scoped to.
  // Length (in bytes): 32
  const rpIdHash = Hash.sha256(Buffer.from(rpId));

  // Bit 0 (UP - User Present): Result of the user presence test
  // (1 = present, 0 = not present).
  // @see https://www.w3.org/TR/webauthn-3/#concept-user-present
  // Bit 1 (RFU1): Reserved for future use.
  // Bit 2 (UV - User Verified): Result of the user verification test
  // (1 = verified, 0 = not verified).
  // @see https://www.w3.org/TR/webauthn-3/#concept-user-verified
  // Bit 3 (BE - Backup Eligibility): Indicates if the credential is
  // eligible for backup/sync (1 = eligible, 0 = not eligible).
  // @see https://www.w3.org/TR/webauthn-3/#backup-eligibility
  // Bit 4 (BS - Backup State): Indicates if the credential is
  // currently backed up (1 = backed up, 0 = not backed up).
  // @see https://www.w3.org/TR/webauthn-3/#backup-state
  // Bit 5 (RFU2): Reserved for future use.
  // Bit 6 (AT - Attested Credential Data Included): Indicates if
  // attested credential data is included.
  // @see https://www.w3.org/TR/webauthn-3/#attested-credential-data
  // Bit 7 (ED - Extension data included): Indicates if extension data
  // is included in the authenticator data.
  // Length (in bytes): 1

  let flagsInt = 0b00000000;

  // Bit 0: User Present (UP)
  // Always 1 for standard WebAuthn flows
  if (userPresenceEnabled) {
    flagsInt |= 0b00000001;
  }

  // Bit 2: User Verified (UV)
  // Set if user verification is required and the authenticator is capable
  const shouldSetUserVerifiedFlag =
    userVerificationEnabled && requireUserVerification;
  if (shouldSetUserVerifiedFlag) {
    flagsInt |= 0b00000100;
  }

  // BE and BS bits
  // The value of the BE flag is set during authenticatorMakeCredential operation and MUST NOT change.
  // @see https://www.w3.org/TR/webauthn-3/#sctn-credential-backup
  // BE=0, BS=0: Single-device credential.
  //   (e.g., A hardware key or TPM where the key never leaves the chip).
  //
  // BE=0, BS=1: INVALID / NOT ALLOWED.
  //   (A credential cannot be "backed up" if it is not marked "eligible").
  //
  // BE=1, BS=0: Multi-device credential (Passkey), but NOT currently backed up.
  //   (Sync is possible/supported, but currently disabled or inactive).
  //
  // BE=1, BS=1: Multi-device credential (Passkey) and currently backed up.
  //   (The key is synced to the cloud/database and safe from device loss).

  // Bit 3: (BE - Backup Eligibility)
  // Backup eligibility is a credential property and is permanent for a given public key credential source.
  // A backup eligible public key credential source is referred to as a multi-device credential
  // whereas one that is not backup eligible is referred to as a single-device credential.
  // NOTE: We set the 'Backup Eligibility' (BE) flag to 1.
  // Since credentials are stored in a central database rather than
  // on a specific device, they are effectively synced and recoverable.
  flagsInt |= 0b00001000;

  // Bit 4: (BS - Backup State)
  // Public Key Credential Sources may be backed up in some fashion such that they may become
  // present on an authenticator other than their generating authenticator.
  // Backup can occur via mechanisms including but not limited to peer-to-peer sync, cloud sync, local network sync, and manual import/export.
  // NOTE: We set this to 1 because the credential is immediately stored in a central
  // database (cloud), meaning it is already "backed up" and safe from device loss.
  flagsInt |= 0b00010000;

  // Bit 6: Attested Credential Data (AT)
  // Only set if we are creating a new credential (registration),
  // indicated by the presence of credentialId
  if (attestedCredentialData) {
    flagsInt |= 0b01000000;
  }

  // Bit 7: Extension data included
  // NOTE: Extension data is never included.

  const flags = Buffer.from([flagsInt]);

  // Signature counter, 32-bit unsigned big-endian integer.
  // Length (in bytes): 4
  const signCountBuffer = Buffer.alloc(4);
  signCountBuffer.writeUInt32BE(counter, 0);

  // Concatenate authenticator data components per spec.
  // @see https://www.w3.org/TR/webauthn-3/#sctn-authenticator-data
  const authenticatorData = Buffer.concat(
    [
      rpIdHash,
      flags,
      signCountBuffer,
      attestedCredentialData,
      // --- OPTIONAL CREDENTIALS --- (
      //    Extension-defined authenticator data.
      //    This is a CBOR map with extension identifiers as keys,
      //    and authenticator extension outputs as values.
      // )
    ].filter((value) => {
      // Non defined values should be ommited.
      return value !== undefined;
    }),
  );

  return new Uint8Array(authenticatorData);
};
