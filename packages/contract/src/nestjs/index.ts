import { initContract } from '@ts-rest/core';

import { credentialsRouter } from './credentials';
import { healthcheckRouter } from './healthcheck';
import { profileRouter } from './profile';
import { webAuthnCredentialsRouter } from './webAuthnCredentials';

const c = initContract();

export const nestjsContract = c.router(
  {
    healthcheck: healthcheckRouter,
    credentials: credentialsRouter,
    webAuthnCredentials: webAuthnCredentialsRouter,
    profile: profileRouter,
  },
  {
    pathPrefix: '/api',
  },
);
