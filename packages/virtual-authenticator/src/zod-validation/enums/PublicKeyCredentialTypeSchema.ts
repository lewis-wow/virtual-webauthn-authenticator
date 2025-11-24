import z from 'zod';

import { PublicKeyCredentialType } from '../../enums/PublicKeyCredentialType';

export const PublicKeyCredentialTypeSchema = z
  .enum(PublicKeyCredentialType)
  .meta({
    id: 'PublicKeyCredentialType',
    examples: [PublicKeyCredentialType.PUBLIC_KEY],
  });
