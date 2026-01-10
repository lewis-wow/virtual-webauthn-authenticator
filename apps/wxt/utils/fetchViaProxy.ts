import type { FetchFn } from '@repo/virtual-authenticator/browser';

import { extensionMessaging } from '../messaging/extensionMessaging';

/**
 * Custom fetch function that proxies requests through the extension messaging system.
 * Flow: background script -> content script -> main-world -> actual fetch -> response back
 *
 * This is needed because the background script (service worker) cannot directly make
 * fetch requests to the API when CORS is involved. Instead, we proxy through the
 * main-world context which has the same origin as the webpage.
 *
 * @returns FetchFn compatible with VirtualAuthenticatorAgentClient
 */
export const fetchViaProxy: FetchFn = async (url, init) => {
  // Convert Headers object to plain object for serialization
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

  // Send fetch request through messaging system
  const response = await extensionMessaging.sendMessage('fetch', {
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
