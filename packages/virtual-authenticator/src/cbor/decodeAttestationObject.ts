import * as cbor from '@repo/cbor';
import type { Uint8Array_ } from '@repo/types';

import type { AttestationObjectMap } from './AttestationObjectMap';

export const decodeAttestationObject = (
  attestationObject: Uint8Array_,
): AttestationObjectMap => {
  return cbor.decode<AttestationObjectMap>(attestationObject);
};
