import { initContract } from '@ts-rest/core';

import { credentialsRouter } from './credentials';
import { healthcheckRouter } from './healthcheck';
import { logsRouter } from './logs';
import { profileRouter } from './profile';
import { webAuthnCredentialsRouter } from './webAuthnCredentials';

const c = initContract();

export const nestjsContract = c.router(
  {
    api: c.router({
      healthcheck: healthcheckRouter,
      credentials: credentialsRouter,
      webAuthnCredentials: webAuthnCredentialsRouter,
      profile: profileRouter,
      logs: logsRouter,
    }),
  },
  {
    pathPrefix: '/api',
  },
);
