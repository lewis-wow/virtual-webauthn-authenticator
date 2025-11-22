import { Schema } from 'effect';

import { PublicKeyCredentialType } from '../../enums/PublicKeyCredentialType';

export const PublicKeyCredentialTypeSchema = Schema.Enums(
  PublicKeyCredentialType,
).pipe(
  Schema.annotations({
    identifier: 'PublicKeyCredentialType',
    examples: [PublicKeyCredentialType.PUBLIC_KEY],
  }),
);
