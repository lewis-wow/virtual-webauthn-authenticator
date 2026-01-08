import { VirtualAuthenticatorApiClient } from '@repo/browser/background';

let virtualAuthenticatorApiClientInstance: VirtualAuthenticatorApiClient;

export const getVirtualAuthenticatorApiClient =
  async (): Promise<VirtualAuthenticatorApiClient> => {
    if (virtualAuthenticatorApiClientInstance) {
      return virtualAuthenticatorApiClientInstance;
    }

    const apiKey = await apiKeyItem.getValue();

    virtualAuthenticatorApiClientInstance = new VirtualAuthenticatorApiClient({
      baseUrl: import.meta.env.WXT_API_BASE_URL,
      apiKey,
    });

    return virtualAuthenticatorApiClientInstance;
  };
