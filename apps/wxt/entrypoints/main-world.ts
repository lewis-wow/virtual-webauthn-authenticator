import { mainWorldToContentScriptMessaging } from '@/messaging/mainWorldToContentScriptMessaging';
import { Exception } from '@repo/exception';
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

const LOG_PREFIX = 'MAIN';
console.log(`[${LOG_PREFIX}]`, 'Init');

export default defineUnlistedScript(() => {
  console.log(`[${LOG_PREFIX}]`, 'Init');

  navigator.credentials.create = async (opts?: CredentialCreationOptions) => {
    console.log(
      `[${LOG_PREFIX}] Intercepted navigator.credentials.create`,
      opts,
    );

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
        meta: { origin: window.location.origin },
        prevStateToken: undefined,
        nextState: {},
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

    console.log(`[${LOG_PREFIX}] Public key credential:`, publicKeyCredential);

    return publicKeyCredential;
  };

  navigator.credentials.get = async (opts?: CredentialRequestOptions) => {
    console.log(`[${LOG_PREFIX}] Intercepted navigator.credentials.get`, opts);

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
        meta: { origin: window.location.origin },
        prevStateToken: undefined,
        nextState: {},
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

    console.log(`[${LOG_PREFIX}] Public key credential:`, publicKeyCredential);

    return publicKeyCredential;
  };
});
