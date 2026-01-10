import { mainWorldMessaging } from '@/messaging/mainWorldMessaging';
import {
  convertBrowserCreationOptions,
  convertBrowserRequestOptions,
  createPublicKeyCredentialResponseImpl,
  PublicKeyCredentialImpl,
} from '@repo/virtual-authenticator/browser';
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

    const response = await mainWorldMessaging.sendMessage(
      'credentials.create',
      {
        publicKeyCredentialCreationOptions: encodedPkOptions,
        meta: { origin: window.location.origin },
      },
    );

    const publicKeyCredential = PublicKeyCredentialDtoSchema.parse(response);

    return new PublicKeyCredentialImpl({
      id: publicKeyCredential.id,
      rawId: publicKeyCredential.rawId,
      response: createPublicKeyCredentialResponseImpl(
        publicKeyCredential.response,
      ),
      authenticatorAttachment: publicKeyCredential.authenticatorAttachment,
      clientExtensionResults: publicKeyCredential.clientExtensionResults,
    });
  };

  navigator.credentials.get = async (opts?: CredentialRequestOptions) => {
    console.log(`[${LOG_PREFIX}] Intercepted navigator.credentials.get`, opts);

    const publicKeyCredentialRequestOptions = convertBrowserRequestOptions(
      opts?.publicKey,
    );

    const encodedPkOptions = PublicKeyCredentialRequestOptionsDtoSchema.encode(
      publicKeyCredentialRequestOptions!,
    );

    const response = await mainWorldMessaging.sendMessage('credentials.get', {
      publicKeyCredentialRequestOptions: encodedPkOptions,
      meta: { origin: window.location.origin },
    });

    const publicKeyCredential = PublicKeyCredentialDtoSchema.parse(response);

    return new PublicKeyCredentialImpl({
      id: publicKeyCredential.id,
      rawId: publicKeyCredential.rawId,
      response: createPublicKeyCredentialResponseImpl(
        publicKeyCredential.response,
      ),
      authenticatorAttachment: publicKeyCredential.authenticatorAttachment,
      clientExtensionResults: publicKeyCredential.clientExtensionResults,
    });
  };
});
