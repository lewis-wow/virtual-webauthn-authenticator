import z from 'zod';

import { CredentialSelectExceptionPayloadSchema } from '../../validation';

export const CredentialSelectExceptionPayloadDtoSchema =
  CredentialSelectExceptionPayloadSchema.extend({
    // JWT token
    state: z.string(),
  });
