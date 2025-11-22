import { mainWorldMessaging } from '@/messaging/mainWorldMessaging';
import { StandardImplMapper } from '@repo/browser/mappers';
import {
  CreateCredentialRequestBodySchema,
  GetCredentialRequestBodySchema,
} from '@repo/contract/validation';
import { PublicKeyCredentialSchema } from '@repo/virtual-authenticator/validation';
import { Schema } from 'effect';

const LOG_PREFIX = 'MAIN';

export default defineUnlistedScript(() => {
  console.log(`[${LOG_PREFIX}]`, 'Init');

  const fallbackNavigatorCredentialsCreate = navigator.credentials.create;
  navigator.credentials.create = async (opts?: CredentialCreationOptions) => {
    console.log(
      `[${LOG_PREFIX}] Intercepted navigator.credentials.create`,
      opts?.publicKey,
    );

    const publicKeyCredentialCreationOptions = Schema.encodeUnknownSync(
      CreateCredentialRequestBodySchema,
    )({
      publicKeyCredentialCreationOptions: opts?.publicKey,
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

    const parsedData = Schema.decodeUnknownSync(PublicKeyCredentialSchema)(
      response.data,
    );

    return StandardImplMapper.publicKeyCredentialToStandardImpl(parsedData);
  };

  const fallbackNavigatorCredentialsGet = navigator.credentials.get;
  navigator.credentials.get = async (opts?: CredentialRequestOptions) => {
    console.log(
      `[${LOG_PREFIX}] Intercepted navigator.credentials.get`,
      opts?.publicKey,
    );

    const publicKeyCredentialRequestOptions = Schema.encodeUnknownSync(
      GetCredentialRequestBodySchema,
    )({
      publicKeyCredentialRequestOptions: opts?.publicKey,
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

    const parsedData = Schema.decodeUnknownSync(PublicKeyCredentialSchema)(
      response.data,
    );

    return StandardImplMapper.publicKeyCredentialToStandardImpl(parsedData);
  };
});
