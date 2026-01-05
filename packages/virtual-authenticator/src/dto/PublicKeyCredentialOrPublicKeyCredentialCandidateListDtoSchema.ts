import z from 'zod';

import { PublicKeyCredentialCandidateDtoSchema } from './PublicKeyCredentialCandidateDtoSchema';
import { PublicKeyCredentialDtoSchema } from './PublicKeyCredentialDtoSchema';

export const PublicKeyCredentialOrPublicKeyCredentialCandidateListDtoSchema =
  PublicKeyCredentialDtoSchema.or(
    z.array(PublicKeyCredentialCandidateDtoSchema),
  );
