import { initContract } from '@ts-rest/core';

import { authRouter } from './auth';
import { credentialsRouter } from './credentials';
import { healthcheckRouter } from './healthcheck';
import { profileRouter } from './profile';
import { webAuthnCredentialsRouter } from './webAuthnCredentials';

const c = initContract();

export const apiRouter = c.router(
  {
    healthcheck: healthcheckRouter,
    credentials: credentialsRouter,
    webAuthnCredentials: webAuthnCredentialsRouter,
    auth: authRouter,
    profile: profileRouter,
  },
  {
    pathPrefix: '/api',
  },
);
