import z from 'zod';

import { ApplicablePublicKeyCredentialDtoSchema } from './ApplicablePublicKeyCredentialDtoSchema';
import { PublicKeyCredentialDtoSchema } from './PublicKeyCredentialDtoSchema';

export const PublicKeyCredentialOrApplicablePublicKeyCredentialsListDtoSchema =
  PublicKeyCredentialDtoSchema.or(
    z.array(ApplicablePublicKeyCredentialDtoSchema),
  );
