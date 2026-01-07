import { getVirtualAuthenticatorAgentClient } from '@/utils/getVirtualAuthenticatorAgentClient';

import { extensionMessaging } from '../messaging/extensionMessaging';

const LOG_PREFIX = 'BACKGROUND';

console.log(`[${LOG_PREFIX}]`, 'Init');

export default defineBackground(() => {
  console.log(`[${LOG_PREFIX}]`, 'Init', {
    id: browser.runtime.id,
  });

  extensionMessaging.onMessage('credentials.create', async (req) => {
    const virtualAuthenticatorAgentClient =
      await getVirtualAuthenticatorAgentClient();

    const publicKeyCredential =
      await virtualAuthenticatorAgentClient.createCredential(req.data);

    return publicKeyCredential;
  });

  extensionMessaging.onMessage('credentials.get', async (req) => {
    const virtualAuthenticatorAgentClient =
      await getVirtualAuthenticatorAgentClient();

    const publicKeyCredentialOrApplicablePublicKeyCredentialsList =
      await virtualAuthenticatorAgentClient.getAssertion(req.data);

    return publicKeyCredentialOrApplicablePublicKeyCredentialsList;
  });
});
