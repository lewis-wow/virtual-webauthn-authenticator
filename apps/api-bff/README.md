# @repo/api-bff

The public-facing backend-for-frontend that the [`@repo/wxt`](../wxt) browser extension (and any other API-key-holding client) talks to. It exists because [`@repo/nestjs`](../nestjs) only accepts short-lived JWTs, while external callers only ever hold a long-lived API key — this Hono service sits in front of `nestjs` so those callers never need to know JWTs exist.

On every request it reads the `Authorization: Bearer <apiKey>` header, exchanges the API key for a JWT by calling [`@repo/auth-server`](../auth-server)'s token endpoint, and re-proxies the request onward to `nestjs` (via `@repo/proxy`) with that JWT attached instead. Requests without an API key are proxied through unauthenticated, leaving `nestjs`'s own guards to decide what's allowed.
