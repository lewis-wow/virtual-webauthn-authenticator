import dotenv from '@dotenvx/dotenvx';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import {
  useSession,
  useSessionStorage,
  type SessionData,
  type SessionEnv,
} from '@hono/session';
import {
  type AuthenticationResponseJSON,
  // Authentication
  generateAuthenticationOptions,
  type GenerateAuthenticationOptionsOpts,
  // Registration
  generateRegistrationOptions,
  type GenerateRegistrationOptionsOpts,
  type RegistrationResponseJSON,
  type VerifiedAuthenticationResponse,
  type VerifiedRegistrationResponse,
  verifyAuthenticationResponse,
  type VerifyAuthenticationResponseOpts,
  verifyRegistrationResponse,
  type VerifyRegistrationResponseOpts,
  type WebAuthnCredential,
} from '@simplewebauthn/server';
import { Hono } from 'hono';
import { createStorage } from 'unstorage';

dotenv.config();

interface StorageData extends SessionData {
  id: string;
  username: string;
  credentials: any[];
  currentChallenge?: string;
}

const host = '127.0.0.1';
const port = 9999;
const rpID = `http://localhost:${port}`;
const expectedOrigin = rpID;
const secret = 'secret';

const storage = createStorage<StorageData>();

const app = new Hono<SessionEnv<StorageData>>()
  .use(serveStatic({ root: './public/' }))
  .use(
    useSessionStorage({
      delete(sid) {
        storage.remove(sid);
      },
      get(sid) {
        return storage.get(sid);
      },
      set(sid, data) {
        storage.set(sid, data);
      },
    }),
    useSession({ secret }),
  );

/**
 * Registration
 */
app.get('/generate-registration-options', async (ctx) => {
  const user = (await ctx.var.session.get())!;

  const {
    /**
     * The username can be a human-readable name, email, etc... as it is intended only for display.
     */
    username,
    credentials,
  } = user;

  const opts: GenerateRegistrationOptionsOpts = {
    rpName: 'SimpleWebAuthn Example',
    rpID,
    userName: username,
    timeout: 60000,
    attestationType: 'none',
    /**
     * Passing in a user's list of already-registered credential IDs here prevents users from
     * registering the same authenticator multiple times. The authenticator will simply throw an
     * error in the browser if it's asked to perform registration when it recognizes one of the
     * credential ID's.
     */
    excludeCredentials: credentials.map((cred) => ({
      id: cred.id,
      type: 'public-key',
      transports: cred.transports,
    })),
    authenticatorSelection: {
      residentKey: 'discouraged',
      /**
       * Wondering why user verification isn't required? See here:
       *
       * https://passkeys.dev/docs/use-cases/bootstrapping/#a-note-about-user-verification
       */
      userVerification: 'preferred',
    },
    /**
     * Support the two most common algorithms: ES256, and RS256
     */
    supportedAlgorithmIDs: [-7, -257],
  };

  const options = await generateRegistrationOptions(opts);

  /**
   * The server needs to temporarily remember this value for verification, so don't lose it until
   * after you verify the registration response.
   */
  ctx.var.session.update({ currentChallenge: options.challenge });

  return ctx.json(options);
});

app.post('/verify-registration', async (ctx) => {
  const user = (await ctx.var.session.get())!;
  const body: RegistrationResponseJSON = await ctx.req.json();

  const expectedChallenge = user.currentChallenge;

  let verification: VerifiedRegistrationResponse;
  try {
    const opts: VerifyRegistrationResponseOpts = {
      response: body,
      expectedChallenge: `${expectedChallenge}`,
      expectedOrigin,
      expectedRPID: rpID,
      requireUserVerification: false,
    };
    verification = await verifyRegistrationResponse(opts);
  } catch (error) {
    console.error(error);

    return ctx.json({ error: (error as Error).message }, 400);
  }

  const { verified, registrationInfo } = verification;

  if (verified && registrationInfo) {
    const { credential } = registrationInfo;

    const existingCredential = user.credentials.find(
      (cred) => cred.id === credential.id,
    );

    if (!existingCredential) {
      /**
       * Add the returned credential to the user's list of credentials
       */
      const newCredential: WebAuthnCredential = {
        id: credential.id,
        publicKey: credential.publicKey,
        counter: credential.counter,
        transports: body.response.transports,
      };
      user.credentials.push(newCredential);
    }
  }

  ctx.var.session.update({ currentChallenge: undefined });

  return ctx.json({ verified });
});

/**
 * Login (a.k.a. "Authentication")
 */
app.get('/generate-authentication-options', async (ctx) => {
  const user = (await ctx.var.session.get())!;

  const opts: GenerateAuthenticationOptionsOpts = {
    timeout: 60000,
    allowCredentials: user.credentials.map((cred) => ({
      id: cred.id,
      type: 'public-key',
      transports: cred.transports,
    })),
    /**
     * Wondering why user verification isn't required? See here:
     *
     * https://passkeys.dev/docs/use-cases/bootstrapping/#a-note-about-user-verification
     */
    userVerification: 'preferred',
    rpID,
  };

  const options = await generateAuthenticationOptions(opts);

  /**
   * The server needs to temporarily remember this value for verification, so don't lose it until
   * after you verify the authentication response.
   */
  ctx.var.session.update({ currentChallenge: options.challenge });

  return ctx.json(options);
});

app.post('/verify-authentication', async (ctx) => {
  const user = (await ctx.var.session.get())!;
  const body: AuthenticationResponseJSON = await ctx.req.json();

  const expectedChallenge = user.currentChallenge;

  let dbCredential: WebAuthnCredential | undefined;
  // "Query the DB" here for a credential matching `cred.id`
  for (const cred of user.credentials) {
    if (cred.id === body.id) {
      dbCredential = cred;
      break;
    }
  }

  if (!dbCredential) {
    return ctx.json(
      {
        error: 'Authenticator is not registered with this site',
      },
      400,
    );
  }

  let verification: VerifiedAuthenticationResponse;
  try {
    const opts: VerifyAuthenticationResponseOpts = {
      response: body,
      expectedChallenge: `${expectedChallenge}`,
      expectedOrigin,
      expectedRPID: rpID,
      credential: dbCredential,
      requireUserVerification: false,
    };
    verification = await verifyAuthenticationResponse(opts);
  } catch (error) {
    const _error = error as Error;
    console.error(_error);
    return ctx.json({ error: _error.message }, 400);
  }

  const { verified, authenticationInfo } = verification;

  if (verified) {
    // Update the credential's counter in the DB to the newest count in the authentication
    dbCredential.counter = authenticationInfo.newCounter;
  }

  ctx.var.session.update({ currentChallenge: undefined });

  return ctx.json({ verified });
});

serve(
  {
    fetch: app.fetch,
    hostname: host,
    port: port,
  },
  (info) => {
    console.log(
      `🚀 Example server ready at ${expectedOrigin} (${info.address}:${info.port})`,
    );
  },
);
