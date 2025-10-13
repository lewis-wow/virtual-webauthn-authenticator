const originalCredentials = navigator.credentials;

const prefix = '[Injector]';

export const consoleProxy = new Proxy(console, {
  get(target, prop) {
    const originalMethod = target[prop];

    if (typeof originalMethod === 'function') {
      return (...args) => {
        originalMethod.apply(target, [prefix, ...args]);
      };
    }

    return originalMethod;
  },
});

const credentialsProxy = new Proxy(originalCredentials, {
  get(_target, prop) {
    consoleProxy.log(`Intercepted navigator.credentials.${prop.toString()}()`);
    consoleProxy.log(`Dispatching fetch request to google.com...`);

    switch (prop) {
      case 'get': {
        /**
         * @param {CredentialRequestOptions} [args]
         */
        return async (args) => {
          consoleProxy.log(args);

          await fetch('https://google.com')
            .then((res) =>
              consoleProxy.log(`Fetch to google.com status: ${res.status}`),
            )
            .catch((err) => consoleProxy.error(`[PROXY] Fetch failed:`, err));
        };
      }
      case 'create': {
        /**
         * @param {CredentialCreationOptions} [args]
         */
        return async (args) => {
          consoleProxy.log(args);

          await fetch('https://google.com')
            .then((res) =>
              consoleProxy.log(`Fetch to google.com status: ${res.status}`),
            )
            .catch((err) => consoleProxy.error(`Fetch failed:`, err));
        };
      }
      default: {
        throw new Error(
          `${prefix} navigator.credentials.${prop.toString()}() is not implemented yet.`,
        );
      }
    }
  },
});

Object.defineProperty(navigator, 'credentials', {
  value: credentialsProxy,
  writable: true,
  configurable: true,
});

consoleProxy.log(
  'navigator.credentials has been successfully replaced with a Proxy.',
);
