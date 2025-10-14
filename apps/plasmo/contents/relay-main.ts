import { sendToBackground } from '@plasmohq/messaging';
import { relay } from '@plasmohq/messaging/relay';
import type { PlasmoCSConfig } from 'plasmo';

export const config: PlasmoCSConfig = {
  matches: ['<all_urls>'],
};

relay(
  {
    name: 'fetch-google' as const,
  },
  async (req) => {
    console.log(req);
    const openResult = await sendToBackground(req);
    console.log(openResult);
    return openResult;
  },
);
