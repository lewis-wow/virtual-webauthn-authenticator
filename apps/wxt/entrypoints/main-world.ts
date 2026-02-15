import { mainWorldToContentScriptMessaging } from '@/messaging/mainWorldToContentScriptMessaging';
import { Exception } from '@repo/exception';
import { Logger } from '@repo/logger';
import { delayPromise, randomInt } from '@repo/utils';
import {
  convertBrowserCreationOptions,
  convertBrowserRequestOptions,
  createPublicKeyCredentialResponseImpl,
  PublicKeyCredentialImpl,
} from '@repo/virtual-authenticator/browser';
import { parseAuthenticatorData } from '@repo/virtual-authenticator/cbor';
import {
  PublicKeyCredentialCreationOptionsDtoSchema,
  PublicKeyCredentialDtoSchema,
  PublicKeyCredentialRequestOptionsDtoSchema,
} from '@repo/virtual-authenticator/dto';

const logger = new Logger({ prefix: 'MAIN' });
logger.info('Init');

export default defineUnlistedScript(() => {
  logger.info('Init');

  navigator.credentials.create = async (opts?: CredentialCreationOptions) => {
    logger.info('Intercepted navigator.credentials.create', opts);

    const publicKeyCredentialCreationOptions = convertBrowserCreationOptions(
      opts?.publicKey,
    );

    const encodedPkOptions = PublicKeyCredentialCreationOptionsDtoSchema.encode(
      publicKeyCredentialCreationOptions!,
    );

    const response = await mainWorldToContentScriptMessaging.sendMessage(
      'credentials.create',
      {
        publicKeyCredentialCreationOptions: encodedPkOptions,
      },
    );

    if (!response.ok) {
      throw new Exception(response.error);
    }

    const parsedPublicKeyCredential = PublicKeyCredentialDtoSchema.parse(
      response.data,
    );

    const publicKeyCredential = new PublicKeyCredentialImpl({
      id: parsedPublicKeyCredential.id,
      rawId: parsedPublicKeyCredential.rawId,
      response: createPublicKeyCredentialResponseImpl(
        parsedPublicKeyCredential.response,
      ),
      authenticatorAttachment:
        parsedPublicKeyCredential.authenticatorAttachment,
      clientExtensionResults: parsedPublicKeyCredential.clientExtensionResults,
    });

    logger.info('Public key credential:', publicKeyCredential);

    return publicKeyCredential;
  };

  navigator.credentials.get = async (opts?: CredentialRequestOptions) => {
    logger.info('Intercepted navigator.credentials.get', opts);

    const publicKeyCredentialRequestOptions = convertBrowserRequestOptions(
      opts?.publicKey,
    );

    const encodedPkOptions = PublicKeyCredentialRequestOptionsDtoSchema.encode(
      publicKeyCredentialRequestOptions!,
    );

    const response = await mainWorldToContentScriptMessaging.sendMessage(
      'credentials.get',
      {
        publicKeyCredentialRequestOptions: encodedPkOptions,
      },
    );

    if (!response.ok) {
      throw new Exception(response.error);
    }

    const parsedPublicKeyCredential = PublicKeyCredentialDtoSchema.parse(
      response.data,
    );

    const publicKeyCredential = new PublicKeyCredentialImpl({
      id: parsedPublicKeyCredential.id,
      rawId: parsedPublicKeyCredential.rawId,
      response: createPublicKeyCredentialResponseImpl(
        parsedPublicKeyCredential.response,
      ),
      authenticatorAttachment:
        parsedPublicKeyCredential.authenticatorAttachment,
      clientExtensionResults: parsedPublicKeyCredential.clientExtensionResults,
    });

    logger.info('Public key credential:', publicKeyCredential);

    return publicKeyCredential;
  };
});
