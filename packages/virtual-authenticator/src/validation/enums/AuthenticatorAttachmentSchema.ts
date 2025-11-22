import { Schema } from 'effect';

import { AuthenticatorAttachment } from '../../enums/AuthenticatorAttachment';

export const AuthenticatorAttachmentSchema = Schema.Enums(
  AuthenticatorAttachment,
).pipe(
  Schema.annotations({
    identifier: 'AuthenticatorAttachment',
    examples: [AuthenticatorAttachment.PLATFORM],
  }),
);
