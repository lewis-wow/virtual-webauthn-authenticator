import type { Uint8Array_ } from '@repo/types';

import type { AttestationStatementMap } from '../../cbor/AttestationStatementMap';
import { Fmt } from '../../enums/Fmt';
import { SignatureFailed } from '../../exceptions/SignatureFailed';
import type { IKeyProvider } from '../../types';
import type { WebAuthnPublicKeyCredentialWithMeta } from '../../types/WebAuthnPublicKeyCredentialWithMeta';
import { createDataToSign } from '../helpers/createDataToSign';
import type { AttestationHandler } from './AttestationHandler';

export type PackedAttestationHandlerOptions = {
  keyProvider: IKeyProvider;
};

export class PackedAttestationHandler implements AttestationHandler {
  readonly attestationFormat = Fmt.PACKED;

  private readonly keyProvider: IKeyProvider;

  constructor(opts: PackedAttestationHandlerOptions) {
    this.keyProvider = opts.keyProvider;
  }

  async createAttestation(opts: {
    webAuthnPublicKeyCredential: WebAuthnPublicKeyCredentialWithMeta;
    data: {
      clientDataHash: Uint8Array_;
      authData: Uint8Array_;
    };
  }): Promise<AttestationStatementMap> {
    const { webAuthnPublicKeyCredential, data } = opts;

    const dataToSign = createDataToSign(data);

    // Sign the data to create the attestation signature
    const { signature, alg } = await this.keyProvider
      .sign({
        data: dataToSign,
        webAuthnPublicKeyCredential,
      })
      .catch((error) => {
        throw new SignatureFailed({
          cause: error,
        });
      });

    // For packed self-attestation, attStmt contains alg and sig
    const attStmt = new Map<string, Uint8Array | number>([
      ['alg', alg],
      ['sig', new Uint8Array(signature)],
    ]) as AttestationStatementMap;

    return attStmt;
  }
}
