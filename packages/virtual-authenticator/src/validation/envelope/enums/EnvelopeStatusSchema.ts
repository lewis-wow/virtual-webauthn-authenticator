import z from 'zod';

import { EnvelopeStatus } from '../../../enums/envelope/EnvelopeStatus';

export const EnvelopeStatusSchema = z.enum(EnvelopeStatus);
