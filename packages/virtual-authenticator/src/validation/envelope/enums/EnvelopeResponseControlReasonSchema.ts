import z from 'zod';

import { EnvelopeResponseControlReason } from '../../../enums/envelope/EnvelopeResponseControlReason';

export const EnvelopeResponseControlReasonSchema = z.enum(
  EnvelopeResponseControlReason,
);
