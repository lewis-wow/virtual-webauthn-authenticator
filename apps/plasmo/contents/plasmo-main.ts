import { sendToBackgroundViaRelay } from '@plasmohq/messaging';
import {
  PublicKeyCredentialCreationOptionsBrowserSchema,
  PublicKeyCredentialCreationOptionsSchema,
  PublicKeyCredentialRequestOptionsBrowserSchema,
  PublicKeyCredentialRequestOptionsSchema,
  PublicKeyCredentialSchema,
} from '@repo/validation';
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

const fallbackNavigatorCredentialsGet = navigator.credentials.get;
navigator.credentials.get = async (opts?: CredentialRequestOptions) => {
  const result = PublicKeyCredentialRequestOptionsBrowserSchema.safeParse(
    opts?.publicKey,
  );

  if (!result.success) {
    return fallbackNavigatorCredentialsGet(opts);
  }

  console.log(
    `[${LOG_PREFIX}] Intercepted navigator.credentials.get`,
    result.data,
  );

  const response = await sendToBackgroundViaRelay({
    name: 'navigator.credentials.get',
    body: PublicKeyCredentialRequestOptionsSchema.encode(result.data),
  });

  console.log(`[${LOG_PREFIX}] response: `, response);
  return PublicKeyCredentialSchema.parse(response.data);
};

const fallbackNavigatorCredentialsCreate = navigator.credentials.create;
navigator.credentials.create = async (opts?: CredentialCreationOptions) => {
  const result = PublicKeyCredentialCreationOptionsBrowserSchema.safeParse(
    opts?.publicKey,
  );

  if (!result.success) {
    return fallbackNavigatorCredentialsCreate(opts);
  }

  console.log(
    `[${LOG_PREFIX}] Intercepted navigator.credentials.create`,
    result.data,
  );

  const response = await sendToBackgroundViaRelay({
    name: 'navigator.credentials.create',
    body: PublicKeyCredentialCreationOptionsSchema.encode(result.data),
  });

  console.log(`[${LOG_PREFIX}] response: `, response);
  return PublicKeyCredentialSchema.parse(response.data);
};
