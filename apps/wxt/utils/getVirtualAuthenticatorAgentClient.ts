import { VirtualAuthenticatorAgentClient } from '@repo/browser';

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
      });

    return virtualAuthenticatorAgentClientInstance;
  };
