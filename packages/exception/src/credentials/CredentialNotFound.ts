import { HTTPExceptionCode } from '@repo/enums';
import type { PublicKeyCredentialRequestOptions } from '@repo/validation';
import type { PickDeep } from 'type-fest';

import { HTTPException } from '../HTTPException';

export class CredentialNotFound extends HTTPException {
  constructor(opts: {
    publicKeyCredentialRequestOptions: PickDeep<
      PublicKeyCredentialRequestOptions,
      `allowCredentials.${number}.id` | 'rpId'
    >;
    userId: string;
  }) {
    const { publicKeyCredentialRequestOptions, userId } = opts;

    super({
      status: 404,
      code: HTTPExceptionCode.CREDENTIAL_NOT_FOUND,
      message: `Credential not found for user (${userId}) with request options ${JSON.stringify(publicKeyCredentialRequestOptions)}`,
    });
  }
}
