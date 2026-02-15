import { Hash } from '@repo/crypto';

import { PublicKeyCredentialRequestOptionsDtoSchema } from '../../dto/spec/PublicKeyCredentialRequestOptionsDtoSchema';
import type { AuthenticatorAgentMetaArgs } from '../../validation/authenticatorAgent/AuthenticatorAgentMetaArgsSchema';
import type { PublicKeyCredentialRequestOptions } from '../../validation/spec/PublicKeyCredentialRequestOptionsSchema';

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
