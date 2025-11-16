import { sendToBackground } from '@plasmohq/messaging';
import { relay } from '@plasmohq/messaging/relay';
import type { PlasmoCSConfig } from 'plasmo';

const LOG_PREFIX = 'RELAY-MAIN';

export const config: PlasmoCSConfig = {
  matches: ['<all_urls>'],
};

relay(
  {
    name: 'navigator.credentials.get' as const,
  },
  async (req) => {
    console.log(`[${LOG_PREFIX}]`, 'navigator.credentials.get', req);
    return await sendToBackground(req);
  },
);

relay(
  {
    name: 'navigator.credentials.create' as const,
  },
  async (req) => {
    console.log(`[${LOG_PREFIX}]`, 'navigator.credentials.create', req);
    return await sendToBackground(req);
  },
);
