import { HTTPExceptionCode } from '@repo/enums';

import { HTTPException } from '../HTTPException';

export class CredentialNotFound extends HTTPException {
  constructor(opts: { rpId: string; userId: string }) {
    super({
      status: 404,
      code: HTTPExceptionCode.CREDENTIAL_NOT_FOUND,
      message: `Credential not found. Please check the \`rpId\` (${opts.rpId}) and if the authenticated user with ID (${opts.userId}) has access to the credential you are requesting.`,
    });
  }
}
