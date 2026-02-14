import { Hash } from '@repo/crypto';

import { PublicKeyCredentialCreationOptionsDtoSchema } from '../../dto/spec/PublicKeyCredentialCreationOptionsDtoSchema';
import type { AuthenticatorAgentMetaArgs } from '../../validation/authenticatorAgent/AuthenticatorAgentMetaArgsSchema';
import type { PublicKeyCredentialCreationOptions } from '../../validation/spec/PublicKeyCredentialCreationOptionsSchema';

export const hashCreateCredentialOptionsAsHex = (opts: {
  pkOptions: PublicKeyCredentialCreationOptions;
  meta: AuthenticatorAgentMetaArgs;
}): string => {
  const { pkOptions, meta } = opts;

  return Hash.sha256JSONHex({
    pkOptions: PublicKeyCredentialCreationOptionsDtoSchema.encode(pkOptions),
    meta,
  });
};
