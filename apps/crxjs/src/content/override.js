const originalCredentials = navigator.credentials;

const LOG_PREFIX = '[Injector]';

const credentialsProxy = new Proxy(originalCredentials, {
  get(_target, prop) {
    console.log(
      LOG_PREFIX,
      `Intercepted navigator.credentials.${prop.toString()}()`,
    );

    switch (prop) {
      case 'get': {
        /**
         * @param {CredentialRequestOptions} [args]
         */
        return async (args) => {
          await fetch(
            `${document.currentScript.dataset.apiBaseUrl}/credentails/`,
            {
              method: 'GET',
            },
          )
            .then((res) =>
              console.log(
                LOG_PREFIX,
                `Fetch to google.com status: ${res.status}`,
              ),
            )
            .catch((err) => console.error(LOG_PREFIX, `Fetch failed:`, err));
        };
      }
      case 'create': {
        /**
         * @param {CredentialCreationOptions} [args]
         */
        return async (args) => {
          await fetch(
            `${document.currentScript.dataset.apiBaseUrl}/credentails/`,
            {
              method: 'POST',
            },
          )
            .then((res) =>
              console.log(
                LOG_PREFIX,
                `Fetch to google.com status: ${res.status}`,
              ),
            )
            .catch((err) => console.error(LOG_PREFIX, `Fetch failed:`, err));
        };
      }
      default: {
        throw new Error(
          `${LOG_PREFIX} navigator.credentials.${prop.toString()}() is not implemented yet.`,
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
  LOG_PREFIX,
  'navigator.credentials has been successfully replaced with a Proxy.',
);
