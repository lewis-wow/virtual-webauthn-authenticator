import { Schema } from 'effect';

import { AuthenticatorAttachment } from '../../enums/AuthenticatorAttachment';

export const AuthenticatorAttachmentSchema = Schema.Enums(
  AuthenticatorAttachment,
).pipe(
  Schema.annotations({
    identifier: 'AuthenticatorAttachment',
    title: 'AuthenticatorAttachment',
    examples: [AuthenticatorAttachment.PLATFORM],
  }),
);
