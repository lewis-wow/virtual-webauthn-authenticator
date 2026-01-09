import * as cbor from 'cbor2';

import type { AttestationObjectMap } from './AttestationObjectMap';

export const decodeAttestationObject = (
  attestationObject: Uint8Array,
): AttestationObjectMap => {
  return cbor.decode<AttestationObjectMap>(attestationObject, {
    preferMap: true,
  });
};
