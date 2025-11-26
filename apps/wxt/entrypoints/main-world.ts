import { mainWorldMessaging } from '@/messaging/mainWorldMessaging';
import { StandardImplMapper } from '@repo/browser/mappers';
import {
  PublicKeyCredentialCreationOptionsBrowserSchema,
  PublicKeyCredentialRequestOptionsBrowserSchema,
} from '@repo/browser/zod-validation';
import {
  CreateCredentialRequestBodySchema,
  GetCredentialRequestBodySchema,
  PublicKeyCredentialDtoSchema,
} from '@repo/contract/zod-validation';

const LOG_PREFIX = 'MAIN';

export default defineUnlistedScript(() => {
  console.log(`[${LOG_PREFIX}]`, 'Init');

  const fallbackNavigatorCredentialsCreate = navigator.credentials.create;
  navigator.credentials.create = async (opts?: CredentialCreationOptions) => {
    console.log(
      `[${LOG_PREFIX}] Intercepted navigator.credentials.create`,
      opts?.publicKey,
    );

    const publicKeyCredentialCreationOptionsBrowser =
      PublicKeyCredentialCreationOptionsBrowserSchema.parse(opts?.publicKey);

    const publicKeyCredentialCreationOptions =
      CreateCredentialRequestBodySchema.encode({
        publicKeyCredentialCreationOptions:
          publicKeyCredentialCreationOptionsBrowser,
        meta: {
          origin: window.location.origin,
        },
      });

    const response = await mainWorldMessaging.sendMessage(
      'credentials.create',
      publicKeyCredentialCreationOptions,
    );

    console.log(`[${LOG_PREFIX}] response: `, response);

    if (!response.ok) {
      console.error(`[${LOG_PREFIX}] fallback to navigator.credential.create`);
      return fallbackNavigatorCredentialsCreate(opts);
    }

    const parsedData = PublicKeyCredentialDtoSchema.parse(response.data);
    // const parsedDataBrowser =
    //   PublicKeyCredentialBrowserSchema.encode(parsedData);

    const publicKeyCredentialStandardImpl =
      StandardImplMapper.publicKeyCredentialToStandardImpl(parsedData);

    console.error(`[${LOG_PREFIX}]`, publicKeyCredentialStandardImpl);

    return publicKeyCredentialStandardImpl;
  };

  const fallbackNavigatorCredentialsGet = navigator.credentials.get;
  navigator.credentials.get = async (opts?: CredentialRequestOptions) => {
    console.log(
      `[${LOG_PREFIX}] Intercepted navigator.credentials.get`,
      opts?.publicKey,
    );

    const publicKeyCredentialRequestOptionsBrowser =
      PublicKeyCredentialRequestOptionsBrowserSchema.parse(opts?.publicKey);

    const publicKeyCredentialRequestOptions =
      GetCredentialRequestBodySchema.encode({
        publicKeyCredentialRequestOptions:
          publicKeyCredentialRequestOptionsBrowser,
        meta: {
          origin: window.location.origin,
        },
      });

    const response = await mainWorldMessaging.sendMessage(
      'credentials.get',
      publicKeyCredentialRequestOptions,
    );

    console.log(`[${LOG_PREFIX}] response: `, response);

    if (!response.ok) {
      console.error(`[${LOG_PREFIX}] fallback to navigator.credential.get`);
      return fallbackNavigatorCredentialsGet(opts);
    }

    const parsedData = PublicKeyCredentialDtoSchema.parse(response.data);
    // const parsedDataBrowser =
    //   PublicKeyCredentialBrowserSchema.encode(parsedData);

    const publicKeyCredentialStandardImpl =
      StandardImplMapper.publicKeyCredentialToStandardImpl(parsedData);

    console.error(`[${LOG_PREFIX}]`, publicKeyCredentialStandardImpl);

    return publicKeyCredentialStandardImpl;
  };
});
