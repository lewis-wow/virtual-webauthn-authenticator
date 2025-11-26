import { initContract } from '@ts-rest/core';

import { auditLogsRouter } from './auditLogs';
import { credentialsRouter } from './credentials';
import { healthcheckRouter } from './healthcheck';
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
      auditLogs: auditLogsRouter,
    }),
  },
  {
    pathPrefix: '/api',
  },
);
