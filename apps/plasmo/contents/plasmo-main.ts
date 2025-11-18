import { sendToBackgroundViaRelay } from '@plasmohq/messaging';
import {
  AuthenticatorAssertionResponseImpl,
  AuthenticatorAttestationResponseImpl,
  PublicKeyCredentialImpl,
} from '@repo/browser';
import {
  PublicKeyCredentialBrowserSchema,
  PublicKeyCredentialCreationOptionsBrowserSchema,
  PublicKeyCredentialRequestOptionsBrowserSchema,
} from '@repo/browser/validation';
import {
  PublicKeyCredentialCreationOptionsDtoSchema,
  PublicKeyCredentialDtoSchema,
  PublicKeyCredentialRequestOptionsDtoSchema,
} from '@repo/contract/validation';
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

  const publicKeyCredentialRequestOptions =
    PublicKeyCredentialRequestOptionsDtoSchema.encode(result.data);

  console.log(
    `[${LOG_PREFIX}] Intercepted navigator.credentials.get`,
    publicKeyCredentialRequestOptions,
  );

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
    throw new Error('TODO: message');
  }

  const parsedData = PublicKeyCredentialDtoSchema.parse(response.data);
  const browserEncodedData =
    PublicKeyCredentialBrowserSchema.encode(parsedData);

  const authenticatorAssertionResponse = new AuthenticatorAssertionResponseImpl(
    browserEncodedData.response as {
      clientDataJSON: ArrayBuffer;
      authenticatorData: ArrayBuffer;
      signature: ArrayBuffer;
      userHandle: ArrayBuffer | null;
    },
  );

  return new PublicKeyCredentialImpl({
    ...browserEncodedData,
    response: authenticatorAssertionResponse,
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

  const publicKeyCredentialCreationOptions =
    PublicKeyCredentialCreationOptionsDtoSchema.encode(result.data);

  console.log(
    `[${LOG_PREFIX}] Intercepted navigator.credentials.create`,
    publicKeyCredentialCreationOptions,
  );

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
    throw new Error('TODO: message');
  }

  const parsedData = PublicKeyCredentialDtoSchema.parse(response.data);
  const browserEncodedData =
    PublicKeyCredentialBrowserSchema.encode(parsedData);

  const authenticatorAttestationResponse =
    new AuthenticatorAttestationResponseImpl(
      browserEncodedData.response as {
        clientDataJSON: ArrayBuffer;
        attestationObject: ArrayBuffer;
      },
    );

  return new PublicKeyCredentialImpl({
    ...browserEncodedData,
    response: authenticatorAttestationResponse,
    authenticatorAttachment: null,
  });
};
