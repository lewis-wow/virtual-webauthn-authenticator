const originalCredentials = navigator.credentials;

const credentialsProxy = new Proxy(originalCredentials, {
  get(_target, prop) {
    console.log(
      `[PROXY] Intercepted navigator.credentials.${prop.toString()}()`,
    );
    console.log(`[PROXY] Dispatching fetch request to google.com...`);

    switch (prop) {
      case 'get': {
        /**
         * @param {CredentialRequestOptions} [args]
         */
        return async (args) => {
          console.log(args);

          await fetch('https://google.com')
            .then((res) =>
              console.log(`[PROXY] Fetch to google.com status: ${res.status}`),
            )
            .catch((err) => console.error(`[PROXY] Fetch failed:`, err));
        };
      }
      case 'create': {
        /**
         * @param {CredentialCreationOptions} [args]
         */
        return async (args) => {
          console.log(args);

          await fetch('https://google.com')
            .then((res) =>
              console.log(`[PROXY] Fetch to google.com status: ${res.status}`),
            )
            .catch((err) => console.error(`[PROXY] Fetch failed:`, err));
        };
      }
      default: {
        throw new Error(
          `[PROXY] navigator.credentials.${prop.toString()}() is not implemented yet.`,
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

console.log(
  'navigator.credentials has been successfully replaced with a Proxy.',
);
