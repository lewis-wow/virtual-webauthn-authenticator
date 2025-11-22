import { Schema } from 'effect';

export const PublicKeyCredentialEntitySchema = Schema.Struct({
  name: Schema.String.annotations({
    description: 'A human-friendly name for the Relying Party.',
    examples: ['Example Corp'],
  }),
}).annotations({
  identifier: 'PublicKeyCredentialEntity',
  ref: 'PublicKeyCredentialEntity',
});

export type PublicKeyCredentialEntity = Schema.Schema.Type<
  typeof PublicKeyCredentialEntitySchema
>;
