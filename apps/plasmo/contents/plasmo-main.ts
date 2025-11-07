import { sendToBackgroundViaRelay } from '@plasmohq/messaging';
import type { PlasmoCSConfig } from 'plasmo';
import { Logger } from '~node_modules/@repo/logger/src/Logger';

const LOG_PREFIX = 'MAIN';
const log = new Logger({
  prefix: LOG_PREFIX,
});

export const config: PlasmoCSConfig = {
  matches: ['<all_urls>'],
  world: 'MAIN',
  run_at: 'document_start',
};

navigator.credentials.get = async (opts) => {
  log.debug('Intercepted navigator.credentials.get');
  const response = await sendToBackgroundViaRelay({
    name: 'navigator.credentials.get',
    body: {},
  });

  log.debug('response', response);
  return response.data;
};

navigator.credentials.create = async (opts) => {
  log.debug('Intercepted navigator.credentials.create');
  const response = await sendToBackgroundViaRelay({
    name: 'navigator.credentials.create',
    body: opts,
  });

  log.debug('response', response);
  return response.data;
};
