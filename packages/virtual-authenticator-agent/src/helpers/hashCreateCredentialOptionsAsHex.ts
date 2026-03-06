import { Hash } from '@repo/crypto';
import { PublicKeyCredentialCreationOptionsDtoSchema } from '@repo/virtual-authenticator/dto';
import type { PublicKeyCredentialCreationOptions } from '@repo/virtual-authenticator/validation';

import type { AuthenticatorAgentMetaArgs } from '../validation/AuthenticatorAgentMetaArgsSchema';

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
