import { sendToBackground } from '@plasmohq/messaging';
import { relay } from '@plasmohq/messaging/relay';
import type { PlasmoCSConfig } from 'plasmo';
import { Logger } from '~node_modules/@repo/logger/src';

const LOG_PREFIX = 'RELAY-MAIN';
const log = new Logger({
  prefix: LOG_PREFIX,
});

export const config: PlasmoCSConfig = {
  matches: ['<all_urls>'],
};

relay(
  {
    name: 'navigator.credentials.get' as const,
  },
  async (req) => {
    log.debug('navigator.credentials.get', req);
    return await sendToBackground(req);
  },
);

relay(
  {
    name: 'navigator.credentials.create' as const,
  },
  async (req) => {
    log.debug('navigator.credentials.create', req);
    return await sendToBackground(req);
  },
);
