import { sendToBackgroundViaRelay } from '@plasmohq/messaging';
import { StandardImplMapper } from '@repo/browser/mappers';
import {
  PublicKeyCredentialCreationOptionsSchema,
  PublicKeyCredentialSchema,
  PublicKeyCredentialRequestOptionsSchema,
} from '@repo/virtual-authenticator/validation';
import { Schema } from 'effect';
import type { PlasmoCSConfig } from 'plasmo';

const LOG_PREFIX = 'MAIN';
console.log(
  `[${LOG_PREFIX}] Running interceptor. Base URL: ${process.env.PLASMO_PUBLIC_API_BASE_URL}, Token: ${process.env.PLASMO_PUBLIC_API_KEY}`,
);

export const config: PlasmoCSConfig = {
  matches: ['<all_urls>'],
  world: 'MAIN',
  run_at: 'document_start',
};

const fallbackNavigatorCredentialsCreate = navigator.credentials.create;
navigator.credentials.create = async (opts?: CredentialCreationOptions) => {
  console.log(
    `[${LOG_PREFIX}] Intercepted navigator.credentials.create`,
    opts?.publicKey,
  );

  const publicKeyCredentialCreationOptions = Schema.encodeUnknownSync(
    PublicKeyCredentialCreationOptionsSchema,
  )(opts?.publicKey);

  const response = await sendToBackgroundViaRelay({
    name: 'navigator.credentials.create',
    body: {
      publicKeyCredentialCreationOptions,
      meta: {
        origin: window.location.origin,
      },
    },
  });

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
    PublicKeyCredentialRequestOptionsSchema,
  )(opts?.publicKey);

  const response = await sendToBackgroundViaRelay({
    name: 'navigator.credentials.get',
    body: {
      publicKeyCredentialRequestOptions,
      meta: {
        origin: window.location.origin,
      },
    },
  });

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
