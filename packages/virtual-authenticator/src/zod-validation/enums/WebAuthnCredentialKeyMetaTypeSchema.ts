import z from 'zod';

import { WebAuthnCredentialKeyMetaType } from '../../enums/WebAuthnCredentialKeyMetaType';

export const WebAuthnCredentialKeyMetaTypeSchema = z
  .enum(WebAuthnCredentialKeyMetaType)
  .meta({
    id: 'WebAuthnCredentialKeyMetaType',
    examples: [WebAuthnCredentialKeyMetaType.KEY_VAULT],
  });
