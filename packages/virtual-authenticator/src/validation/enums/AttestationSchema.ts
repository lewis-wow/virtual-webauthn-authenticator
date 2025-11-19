import { Schema } from 'effect';

import { Attestation } from '../../enums/Attestation';

export const AttestationSchema = Schema.Enums(Attestation).pipe(
  Schema.annotations({
    identifier: 'Attestation',
    examples: [Attestation.NONE],
  }),
);
