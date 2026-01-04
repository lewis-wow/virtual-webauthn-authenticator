import z from 'zod';

import { WebAuthnPublicKeyCredentialKeyMetaType } from '../../enums/WebAuthnPublicKeyCredentialKeyMetaType';

export const WebAuthnPublicKeyCredentialKeyMetaTypeSchema = z
  .enum(WebAuthnPublicKeyCredentialKeyMetaType)
  .meta({
    id: 'WebAuthnPublicKeyCredentialKeyMetaType',
    examples: [WebAuthnPublicKeyCredentialKeyMetaType.KEY_VAULT],
  });
