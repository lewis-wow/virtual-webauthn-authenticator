import { Hash } from '@repo/crypto';
import { PublicKeyCredentialRequestOptionsDtoSchema } from '@repo/virtual-authenticator/dto';
import type { PublicKeyCredentialRequestOptions } from '@repo/virtual-authenticator/validation';

import type { AuthenticatorAgentMetaArgs } from '../validation/AuthenticatorAgentMetaArgsSchema';

export const hashGetAssertionOptionsAsHex = (opts: {
  pkOptions: PublicKeyCredentialRequestOptions;
  meta: AuthenticatorAgentMetaArgs;
}): string => {
  const { pkOptions, meta } = opts;

  return Hash.sha256JSONHex({
    pkOptions: PublicKeyCredentialRequestOptionsDtoSchema.encode(pkOptions),
    meta,
  });
};
