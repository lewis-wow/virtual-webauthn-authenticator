import { getVirtualAuthenticatorApiClient } from '@/utils/getVirtualAuthenticatorAgentClient';

import { extensionMessaging } from '../messaging/extensionMessaging';

const LOG_PREFIX = 'BACKGROUND';

console.log(`[${LOG_PREFIX}]`, 'Init');

export default defineBackground(() => {
  console.log(`[${LOG_PREFIX}]`, 'Init', {
    id: browser.runtime.id,
  });

  extensionMessaging.onMessage('credentials.create', async (req) => {
    const virtualAuthenticatorApiClient =
      await getVirtualAuthenticatorApiClient();

    // req.data contains { publicKey: serialized DTO, meta will be added }
    const rawResponse = await virtualAuthenticatorApiClient.createCredential({
      publicKey: req.data.publicKey,
      meta: {
        origin: req.sender.origin ?? '',
      },
    });

    // Return raw response - parsing happens in main-world
    return rawResponse;
  });

  extensionMessaging.onMessage('credentials.get', async (req) => {
    const virtualAuthenticatorApiClient =
      await getVirtualAuthenticatorApiClient();

    // req.data contains { publicKey: serialized DTO, meta will be added }
    const rawResponse = await virtualAuthenticatorApiClient.getAssertion({
      publicKey: req.data.publicKey,
      meta: {
        origin: req.sender.origin ?? '',
      },
    });

    // Return raw response - parsing happens in main-world
    return rawResponse;
  });
});
