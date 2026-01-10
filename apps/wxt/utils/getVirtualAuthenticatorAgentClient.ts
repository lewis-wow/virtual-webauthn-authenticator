import { VirtualAuthenticatorAgentClient } from '@repo/virtual-authenticator/browser';

import { fetchViaProxy } from './fetchViaProxy';
import { apiKeyItem } from './storage';

let virtualAuthenticatorAgentClientInstance: VirtualAuthenticatorAgentClient;

export const getVirtualAuthenticatorAgentClient =
  async (): Promise<VirtualAuthenticatorAgentClient> => {
    if (virtualAuthenticatorAgentClientInstance) {
      return virtualAuthenticatorAgentClientInstance;
    }

    const apiKey = await apiKeyItem.getValue();

    virtualAuthenticatorAgentClientInstance =
      new VirtualAuthenticatorAgentClient({
        baseUrl: import.meta.env.WXT_API_BASE_URL,
        apiKey,
        origin: 'http://localhost:3000', // TODO: Make this configurable or detect from tab
        fetch: fetchViaProxy,
      });

    return virtualAuthenticatorAgentClientInstance;
  };
