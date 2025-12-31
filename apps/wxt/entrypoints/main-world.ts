import { mainWorldMessaging } from '@/messaging/mainWorldMessaging';
import { StandardImplMapper } from '@repo/browser/mappers';
import {
  PublicKeyCredentialCreationOptionsBrowserSchema,
  PublicKeyCredentialRequestOptionsBrowserSchema,
} from '@repo/browser/zod-validation';
import {
  CreateCredentialBodySchema,
  GetCredentialBodySchema,
  PublicKeyCredentialDtoSchema,
} from '@repo/contract/dto';

const LOG_PREFIX = 'MAIN';
console.log(`[${LOG_PREFIX}]`, 'Init');

export default defineUnlistedScript(() => {
  const fallbackNavigatorCredentialsCreate = navigator.credentials.create;
  navigator.credentials.create = async (opts?: CredentialCreationOptions) => {
    console.log(
      `[${LOG_PREFIX}] Intercepted navigator.credentials.create`,
      opts?.publicKey,
    );

    const publicKeyCredentialCreationOptionsBrowser =
      PublicKeyCredentialCreationOptionsBrowserSchema.safeParse(
        opts?.publicKey,
      );

    if (!publicKeyCredentialCreationOptionsBrowser.success) {
      console.error(
        `[${LOG_PREFIX}] fallback to navigator.credential.create`,
        publicKeyCredentialCreationOptionsBrowser.error,
      );
      return fallbackNavigatorCredentialsCreate(opts);
    }

    const publicKeyCredentialCreationOptions =
      CreateCredentialBodySchema.encode({
        publicKeyCredentialCreationOptions:
          publicKeyCredentialCreationOptionsBrowser.data,
        meta: {
          origin: window.location.origin,
        },
      });

    console.log(
      `[${LOG_PREFIX}] payload: `,
      publicKeyCredentialCreationOptions,
    );

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

    console.log(`[${LOG_PREFIX}]`, publicKeyCredentialStandardImpl);

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

    const publicKeyCredentialRequestOptions = GetCredentialBodySchema.encode({
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

    console.log(`[${LOG_PREFIX}]`, publicKeyCredentialStandardImpl);

    return publicKeyCredentialStandardImpl;
  };
});
