import { mainWorldMessaging } from '@/messaging/mainWorldMessaging';
import type { FetchFn } from '@repo/virtual-authenticator/browser';
import { VirtualAuthenticatorAgentClient } from '@repo/virtual-authenticator/browser';

const LOG_PREFIX = 'MAIN';
console.log(`[${LOG_PREFIX}]`, 'Init');

export default defineUnlistedScript(() => {
  // Custom fetch function that sends requests through content script
  const fetchViaProxy: FetchFn = async (url, init) => {
    console.log(`[${LOG_PREFIX}]`, 'fetchViaProxy called', { url, init });

    // Convert Headers to plain object for serialization
    const headers: Record<string, string> = {};
    if (init.headers) {
      if (init.headers instanceof Headers) {
        init.headers.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(init.headers)) {
        init.headers.forEach(([key, value]) => {
          headers[key] = value;
        });
      } else {
        Object.assign(headers, init.headers);
      }
    }

    const response = await mainWorldMessaging.sendMessage('fetch', {
      url,
      init: {
        ...init,
        headers,
      },
    });

    return {
      status: response.status,
      json: async () => response.json,
    };
  };

  // Create VirtualAuthenticatorAgentClient instance
  // TODO: Make apiKey and baseUrl configurable via storage or injection
  const client = new VirtualAuthenticatorAgentClient({
    baseUrl: 'http://localhost:3001', // TODO: Make configurable
    apiKey: 'your-api-key', // TODO: Get from storage
    origin: window.location.origin,
    fetch: fetchViaProxy,
  });

  navigator.credentials.create = async (opts?: CredentialCreationOptions) => {
    console.log(
      `[${LOG_PREFIX}] Intercepted navigator.credentials.create`,
      opts,
    );

    try {
      const publicKeyCredential = await client.createCredential(
        opts as CredentialCreationOptions & { publicKey?: any },
      );

      console.log(`[${LOG_PREFIX}] PublicKeyCredential`, publicKeyCredential);

      return publicKeyCredential;
    } catch (error) {
      console.error(`[${LOG_PREFIX}] Create credential error`, error);
      throw error;
    }
  };

  navigator.credentials.get = async (opts?: CredentialRequestOptions) => {
    console.log(`[${LOG_PREFIX}] Intercepted navigator.credentials.get`, opts);

    try {
      const result = await client.getAssertion(
        opts as CredentialRequestOptions & { publicKey?: any },
      );

      console.log(`[${LOG_PREFIX}] PublicKeyCredential`, result);

      return result;
    } catch (error) {
      console.error(`[${LOG_PREFIX}] Get assertion error`, error);
      throw error;
    }
  };
});
