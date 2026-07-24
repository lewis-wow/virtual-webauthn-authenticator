# @repo/auth-server

The identity server for the whole system. It's a standalone Hono service built on [better-auth](https://www.better-auth.com/) that owns user accounts, sessions, and API keys, and issues the short-lived JWTs that [`@repo/nestjs`](../nestjs) trusts for every WebAuthn operation. Neither [`@repo/console`](../console) nor [`@repo/api-bff`](../api-bff) call `nestjs` with a session cookie or API key directly — both exchange whichever credential they hold for a JWT here first.

It exposes better-auth's own handler under `/api/auth/*` for sign-up, sign-in, and session management, a `/.well-known/jwks.json` endpoint so `nestjs` can verify the JWTs it issues, and a set of API key routes (create/list/get/update/delete plus a token-exchange endpoint) that let a signed-in console user mint and manage the API keys the browser extension authenticates with.
