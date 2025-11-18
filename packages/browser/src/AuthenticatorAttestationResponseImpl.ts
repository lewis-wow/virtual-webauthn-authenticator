import * as cbor from 'cbor';

import { AuthenticatorResponseImpl } from './AuthenticatorResponseImpl';

export class AuthenticatorAttestationResponseImpl
  extends AuthenticatorResponseImpl
  implements AuthenticatorAttestationResponse
{
  readonly attestationObject: ArrayBuffer;

  // Caches to prevent repeated expensive parsing
  private _decodedAttestationObject: any = null;
  private _authenticatorData: ArrayBuffer | null = null;
  private _publicKey: ArrayBuffer | null = null;
  private _publicKeyAlgo: COSEAlgorithmIdentifier | undefined;

  constructor(attestationObject: ArrayBuffer, clientDataJSON: ArrayBuffer) {
    super(clientDataJSON);
    this.attestationObject = attestationObject;
  }

  /**
   * Decodes the CBOR attestationObject and extracts the binary authData.
   */
  getAuthenticatorData(): ArrayBuffer {
    if (this._authenticatorData) {
      return this._authenticatorData;
    }

    // 1. Decode the top-level CBOR map
    // attestationObject structure: { "authData": bytes, "fmt": string, "attStmt": map }
    try {
      this._decodedAttestationObject = cbor.decodeFirstSync(
        Buffer.from(this.attestationObject),
      );
    } catch (e) {
      throw new Error('Failed to decode attestationObject: ' + e);
    }

    // 2. Extract authData
    const authDataBuffer = this._decodedAttestationObject.authData;
    if (!authDataBuffer) {
      throw new Error('attestationObject is missing "authData".');
    }

    // Convert Buffer back to ArrayBuffer/Uint8Array for storage
    this._authenticatorData = this._toUint8Array(authDataBuffer).buffer;
    return this._authenticatorData!;
  }

  /**
   * Parses the binary authData to extract the COSE Public Key.
   */
  getPublicKey(): ArrayBuffer | null {
    if (this._publicKey) return this._publicKey;

    const authData = this.getAuthenticatorData();
    const view = new DataView(authData);
    const u8 = new Uint8Array(authData);

    // --- Binary Parsing of Authenticator Data ---

    // 1. Read Flags (Byte 32) to check if Attested Credential Data is present
    // Layout: [RPIDHash (32)] [Flags (1)] [SignCount (4)] ...
    const flags = u8[32];
    const attestationDataIncluded = !!(flags & 0x40); // Bit 6

    if (!attestationDataIncluded) {
      return null;
    }

    // 2. Calculate Offset to Credential Data
    // 32 (RPID) + 1 (Flags) + 4 (Count) = 37 bytes
    let offset = 37;

    // 3. Skip AAGUID (16 bytes)
    offset += 16;

    // 4. Read Credential ID Length (2 bytes, Big-Endian)
    const credIdLen = view.getUint16(offset, false);
    offset += 2;

    // 5. Skip Credential ID
    offset += credIdLen;

    // 6. Extract COSE Public Key
    // The key starts at 'offset'. It is a CBOR map.
    // There might be extensions *after* the key, so we cannot just take the rest of the buffer.
    const remainingBytes = Buffer.from(u8.slice(offset));

    try {
      // decodeFirstSync will decode exactly one CBOR item (the key map)
      // and ignore any trailing bytes (extensions)
      const coseKeyMap = cbor.decodeFirstSync(remainingBytes);

      // Extract the Algorithm while we have the map (Key "3" is "alg")
      // Note: cbor library typically returns a Map for COSE keys
      if (coseKeyMap instanceof Map) {
        this._publicKeyAlgo = coseKeyMap.get(3);
      } else {
        this._publicKeyAlgo = coseKeyMap[3];
      }

      // Re-encode the map to get the exact ArrayBuffer of just the public key
      // This ensures clean separation from any trailing extensions.
      const rawKeyBuffer = cbor.encode(coseKeyMap);
      this._publicKey = this._toUint8Array(rawKeyBuffer).buffer;
    } catch (e) {
      console.error('Failed to parse COSE Public Key', e);
      return null;
    }

    return this._publicKey;
  }

  getPublicKeyAlgorithm(): COSEAlgorithmIdentifier {
    if (this._publicKeyAlgo === undefined) {
      this.getPublicKey(); // Triggers parsing
    }

    if (this._publicKeyAlgo === undefined) {
      // -7 is ES256, -257 is RS256.
      // If we can't find it, strict WebAuthn impls might throw or return a default.
      throw new Error('Algorithm identifier not found in COSE key.');
    }

    return this._publicKeyAlgo;
  }

  /**
   * Transports are usually provided by the browser in a separate field
   * and are not reliably packed into the standard binary attestation object.
   */
  getTransports(): string[] {
    return [];
  }

  toJSON() {
    return {
      id: this.id,
      rawId: this._toBase64Url(this.rawId),
      response: {
        clientDataJSON: this._toBase64Url(this.clientDataJSON),
        attestationObject: this._toBase64Url(this.attestationObject),
        transports: this.getTransports(),
        authenticatorData: this._toBase64Url(this.getAuthenticatorData()),
        publicKey: this.getPublicKey()
          ? this._toBase64Url(this.getPublicKey()!)
          : null,
        publicKeyAlgorithm: this._publicKeyAlgo || null,
      },
      type: 'public-key',
      clientExtensionResults: this.getClientExtensionResults(),
    };
  }

  private _toUint8Array(buffer: Buffer | ArrayBuffer): Uint8Array<ArrayBuffer> {
    return new Uint8Array(buffer);
  }

  private _toBase64Url(buffer: ArrayBuffer): string {
    const str = Buffer.from(buffer).toString('base64');
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
}
