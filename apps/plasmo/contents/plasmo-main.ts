import { sendToBackgroundViaRelay } from '@plasmohq/messaging';
import {
  PublicKeyCredentialBrowserSchema,
  PublicKeyCredentialCreationOptionsBrowserSchema,
  PublicKeyCredentialCreationOptionsDtoSchema,
  PublicKeyCredentialDtoSchema,
  PublicKeyCredentialRequestOptionsBrowserSchema,
  PublicKeyCredentialRequestOptionsDtoSchema,
} from '@repo/validation';
import type { PlasmoCSConfig } from 'plasmo';
import { PublicKeyCredentialImpl } from '~node_modules/@repo/browser/src';

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

  const body = PublicKeyCredentialRequestOptionsDtoSchema.encode(result.data);

  console.log(`[${LOG_PREFIX}] Intercepted navigator.credentials.get`, body);

  const response = await sendToBackgroundViaRelay({
    name: 'navigator.credentials.get',
    body,
  });

  console.log(`[${LOG_PREFIX}] response: `, response);

  if (!response.ok) {
    throw new Error('TODO: message');
  }

  const parsedData = PublicKeyCredentialDtoSchema.parse(response.data);
  const browserEncodedData =
    PublicKeyCredentialBrowserSchema.encode(parsedData);

  return new PublicKeyCredentialImpl({
    ...browserEncodedData,
    authenticatorAttachment: null,
  });
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
    body: PublicKeyCredentialCreationOptionsDtoSchema.encode(result.data),
  });

  console.log(`[${LOG_PREFIX}] response: `, response);

  if (!response.ok) {
    throw new Error('TODO: message');
  }

  const parsedData = PublicKeyCredentialDtoSchema.parse(response.data);
  const browserEncodedData =
    PublicKeyCredentialBrowserSchema.encode(parsedData);

  return new PublicKeyCredentialImpl({
    ...browserEncodedData,
    authenticatorAttachment: null,
  });
};
