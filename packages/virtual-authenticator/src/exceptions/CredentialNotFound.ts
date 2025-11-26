import { Exception } from '@repo/exception';

export const CREDENTIAL_NOT_FOUND = 'CREDENTIAL_NOT_FOUND';

export type CredentialNotFoundData = {
  userId: string;
  rpId: string;
  allowCredentialIds: string[] | undefined;
};

export class CredentialNotFound extends Exception<CredentialNotFoundData> {
  static code = CREDENTIAL_NOT_FOUND;
  static status = 404;
  static message({ userId, rpId, allowCredentialIds }: CredentialNotFoundData) {
    return `Credential not found for user (${userId}) with request options ${JSON.stringify(
      {
        allowCredentialIds,
        rpId,
      },
    )}`;
  }
}
