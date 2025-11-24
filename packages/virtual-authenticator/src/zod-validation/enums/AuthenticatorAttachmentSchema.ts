import z from 'zod';

import { AuthenticatorAttachment } from '../../enums/AuthenticatorAttachment';

export const AuthenticatorAttachmentSchema = z.enum(AuthenticatorAttachment).meta({
  id: 'AuthenticatorAttachment',
  examples: [AuthenticatorAttachment.PLATFORM],
});
