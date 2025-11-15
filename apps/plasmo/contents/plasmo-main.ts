import { sendToBackgroundViaRelay } from '@plasmohq/messaging';
import {
  PublicKeyCredentialCreationOptionsSchema,
  PublicKeyCredentialRequestOptionsSchema,
  PublicKeyCredentialSchema,
} from '@repo/validation';
import type { PlasmoCSConfig } from 'plasmo';

const LOG_PREFIX = 'MAIN';
console.log(`[${LOG_PREFIX}] Running interceptor.`);

export const config: PlasmoCSConfig = {
  matches: ['<all_urls>'],
  world: 'MAIN',
  run_at: 'document_start',
};

navigator.credentials.get = async (opts: any) => {
  console.log(`[${LOG_PREFIX}] Intercepted navigator.credentials.get`);
  const response = await sendToBackgroundViaRelay({
    name: 'navigator.credentials.get',
    body: PublicKeyCredentialRequestOptionsSchema.encode(opts),
  });

  console.log(`[${LOG_PREFIX}] response: `, response);
  return PublicKeyCredentialSchema.parse(response.data);
};

navigator.credentials.create = async (opts: any) => {
  console.log(`[${LOG_PREFIX}] Intercepted navigator.credentials.create`);
  const response = await sendToBackgroundViaRelay({
    name: 'navigator.credentials.create',
    body: PublicKeyCredentialCreationOptionsSchema.encode(opts),
  });

  console.log(`[${LOG_PREFIX}] response: `, response);
  return PublicKeyCredentialSchema.parse(response.data);
};
