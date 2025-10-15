import { sendToBackgroundViaRelay } from '@plasmohq/messaging';
import type { PlasmoCSConfig } from 'plasmo';

export const config: PlasmoCSConfig = {
  matches: ['<all_urls>'],
  world: 'MAIN',
  run_at: 'document_start',
};

navigator.credentials.get = async (opts) => {
  console.log('Intercepted navigator.credentials.get');
  const response = await sendToBackgroundViaRelay({
    name: 'navigator.credentials.get',
    body: {},
  });

  console.log({ response });
  return response.data;
};

navigator.credentials.create = async (opts) => {
  console.log('Intercepted navigator.credentials.create');
  const response = await sendToBackgroundViaRelay({
    name: 'navigator.credentials.create',
    body: opts,
  });

  console.log({ response });
  return response.data;
};
