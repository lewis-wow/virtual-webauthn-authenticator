import z from 'zod';

import { Attestation } from '../../enums/Attestation';

export const AttestationSchema = z.enum(Attestation).meta({
  id: 'Attestation',
  examples: [Attestation.NONE],
});
