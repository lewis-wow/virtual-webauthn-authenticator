# Better Auth

Used in `apps/auth-server` (server instance), `apps/console` (client + server-side proxy), `apps/wxt` (client, currently unwired), and `apps/api-bff` (dependency present but **not actually used** — no `better-auth` import exists anywhere in `apps/api-bff/src`; the API key → JWT exchange there goes through `@repo/bff`'s `TokenFetch` calling `auth-server`'s HTTP endpoint, not the Better Auth SDK directly).

**There are two separate, non-overlapping auth systems in this repo — don't conflate them:**

- **Better Auth** handles human login for the console/admin UI and the browser extension: GitHub OAuth, sessions, session cookies.
- **A custom JWT system** (`@repo/jwt`, `@repo/jwks`, `@repo/api-key`) is what every actual API call to `apps/nestjs` (the WebAuthn authenticator API) authenticates with. It is a hand-rolled EdDSA-signed JWT + Prisma-backed JWKS implementation, independent of Better Auth's own JWT plugin internals.

The bridge between the two: Better Auth's `jwt` plugin is configured in `apps/auth-server` to delegate token *signing* entirely to the custom JWT system (see below), so a logged-in console user and an API-key holder end up with the exact same `JwtPayload` shape, verified the exact same way, by `apps/nestjs`.

## Where the server instance lives

The only `betterAuth(...)` instance in the repo is registered in `apps/auth-server/src/container.ts`, as one entry in that app's `DependencyContainer`:

```ts
.register('auth', ({ prisma, jwtIssuer }) => {
  return betterAuth({
    appName: 'Auth',
    database: prismaAdapter(prisma, { provider: 'postgresql' }),
    socialProviders: {
      github: { clientId: process.env.GITHUB_CLIENT_ID!, clientSecret: process.env.GITHUB_CLIENT_SECRET! },
    },
    plugins: [bearer(), jwtPlugin({ /* ... */ })],
    trustedOrigins: env.TRUSTED_ORIGINS,
    advanced: {
      database: { generateId: false },
      cookies: { session_token: { name: 'session_token', attributes: { secure: process.env.NODE_ENV === 'production' } } },
    },
  });
})
```

Only GitHub social sign-in is configured — no email/password, no other OAuth providers. `apps/nestjs` and `apps/api-bff` never construct or import a `betterAuth()` instance; they only ever see the JWTs it (indirectly) produces.

## The `jwt` plugin's `sign` is overridden to call the custom `JwtIssuer`

This is the single most important convention: Better Auth's `jwt` plugin is **not** used to mint its own tokens or manage its own signing keys. Its `jwt.sign` hook is replaced with a function that builds this app's `JwtPayload` (from `@repo/jwt/validation`) and signs it with the custom `JwtIssuer`:

```ts
jwtPlugin({
  jwks: {
    remoteUrl: `${env.BASE_URL}/.well-known/jwks.json`,
    keyPairConfig: { alg: JWT_ALG },
  },
  jwt: {
    sign: async (payload) => {
      const jwtPayload: JwtPayload = {
        aud: payload.aud, exp: payload.exp, iat: payload.iat, iss: payload.iss,
        jti: payload.jti, nbf: payload.nbf, sub: payload.sub,
        permissions: Object.values(Permission),
        userId: payload.id as string,
        name: payload.name as string,
        email: payload.email as string,
        image: payload.image as string | null,
        apiKeyId: null,
        tokenType: TokenType.USER,
      };
      return await jwtIssuer.sign(jwtPayload);
    },
  },
});
```

`jwks.remoteUrl` points back at this same app's own `/.well-known/jwks.json` route, which is served by the custom `Jwks` class (`@repo/jwt`), not by Better Auth's own key storage — Better Auth is told "keys live over there" rather than being allowed to generate/own its own key pair. The `Jwks` class (`packages/jwt/src/Jwks.ts`) generates EdDSA (`Ed25519`) key pairs with `jose`, encrypts the private key at rest with `@repo/crypto`'s `Encryption`, and persists them via `PrismaAuthJwksRepository`.

If you need to change what claims end up in a session-derived JWT, edit this `sign` function and/or `JwtPayloadSchema` (`packages/jwt/src/validation/JwtPayloadSchema.ts`) — don't reach for Better Auth's default JWT shape or its own JWKS endpoint.

## API keys are a fully custom system, not Better Auth's `apiKey()` plugin

`Permission`, `TokenType`, and API-key CRUD (`apps/auth-server/src/routes/api-keys.ts`) are backed by `ApiKeyManager` (`packages/api-key`), a standalone Prisma-based implementation — Better Auth's built-in `apiKey` plugin is never imported. The reason: API keys here don't authenticate requests directly, they're exchanged for a JWT. `GET /api-keys/token` (`authServerContract.api.auth.apiKeys.getToken`) verifies the plaintext key with `apiKeyManager.verify(...)`, loads the owning user, and calls `jwtIssuer.sign({ ..., tokenType: TokenType.API_KEY, apiKeyId: apiKey.id, permissions: apiKey.permissions })` — the same `JwtIssuer` the `jwt` plugin's `sign` hook uses for session-based logins. This is how `apps/api-bff` and `apps/wxt` (which authenticate with a stored API key, see `apps/wxt/entrypoints/background.ts`) end up producing a JWT that `apps/nestjs`'s `JwtMiddleware`/`JwtAudience` can verify with the exact same code path as a console session.

`packages/auth/src/enums/AuthType.ts` (`SESSION` | `API_KEY`) documents this split at the type level.

## Server-side session middleware

`apps/auth-server/src/routes/index.ts` populates `ctx.var.user`/`ctx.var.session` once, globally, by calling Better Auth's session API directly:

```ts
export const app = factory.createApp().use('*', async (ctx, next) => {
  const auth = container.resolve('auth');
  const session = await auth.api.getSession({ headers: ctx.req.raw.headers });
  ctx.set('user', session?.user ?? null);
  ctx.set('session', session?.session ?? null);
  await next();
});

app.route('/', apiKey);
app.get('/.well-known/jwks.json', /* custom Jwks, not Better Auth's */);
app.on(['POST', 'GET'], '/api/auth/*', (c) => container.resolve('auth').handler(c.req.raw));
```

Downstream, `requireAuthMiddleware` (see `.docs/hono.md`) just checks `ctx.var.session`/`ctx.var.user` — it never calls `auth.api.getSession` itself. Mount the Better Auth HTTP handler at `/api/auth/*` with `auth.handler(c.req.raw)`; don't hand-implement any of its routes.

## Client apps: two client instances per app, one plugin set

Every client (`apps/console/src/lib/authClient.ts`, `apps/console/src/container.ts`, `apps/wxt/authClient.ts`) builds its client the same way:

```ts
import { jwtClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react'; // or 'better-auth/client' server-side

export const authClient = createAuthClient({
  plugins: [jwtClient()],
  // baseURL + fetchOptions.credentials: 'include' when the client runs cross-origin (apps/wxt)
});
```

`apps/console` has **two** instances, and the distinction matters:

- `apps/console/src/lib/authClient.ts` — `'use client'` components (`SigninPage`, `SignupPage`, `useSignOut`) import this one. Plugins: `jwtClient()` only.
- `apps/console/src/container.ts` — registered in the server-side `DependencyContainer`, adds `nextCookies()` (`better-auth/next-js`) on top of `jwtClient()`, because it runs in Next.js server route handlers/actions where Better Auth needs to be able to set cookies on the outgoing response. This instance's `authClient.token({ fetchOptions: { headers } })` call is what `container.ts`'s `tokenFetch` service uses to turn an incoming session cookie into a JWT before proxying to the API (see `apps/console/src/app/api/[[...all]]/route.ts` and `.docs/hono.md`'s proxy section).

`apps/wxt/authClient.ts` exists (with `credentials: 'include'` so the auth-server's session cookie survives cross-origin extension requests) but is **not currently imported anywhere** in `apps/wxt`'s entrypoints — the extension's real authenticated calls (`entrypoints/background.ts`) go through a stored API key sent as a bearer token, not a Better Auth session. Treat this file as scaffolding, not a wired auth path, unless you're the one wiring it up.

`GET /api/auth/*` in `apps/console` (`apps/console/src/app/api/auth/[...all]/route.ts`) is a plain proxy to `env.AUTH_BASE_URL` via `@repo/proxy` — the console app itself never runs a Better Auth server instance, it only forwards to `apps/auth-server`.

## Plugins in use (exhaustive — don't assume others are configured)

- Server: `bearer()`, `jwt()` (both from `better-auth/plugins`, `apps/auth-server` only).
- Client: `jwtClient()` (from `better-auth/client/plugins`, all client apps), `nextCookies()` (from `better-auth/next-js`, `apps/console`'s server-side container only).

No `admin`, `organization`, `twoFactor`, `apiKey`, or other Better Auth plugins are configured anywhere in this repo. If a task seems to need one, check whether the custom `@repo/api-key`/`@repo/jwt` system should be extended instead before reaching for a Better Auth plugin.

## Docs

- llms.txt: https://www.better-auth.com/llms.txt
- Official docs: https://www.better-auth.com/docs

If you need to do something with Better Auth that isn't covered by the conventions above (a new plugin, a different social provider, email/password flows, etc.), check the official docs linked above rather than guessing — and re-check whether the custom `@repo/jwt`/`@repo/api-key` systems already cover the need before extending the Better Auth instance itself.
