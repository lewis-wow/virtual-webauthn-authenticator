# @repo/console

The admin console — a Next.js app where a signed-in user manages their virtual WebAuthn setup: creating and inspecting virtual authenticators and their public key credentials, issuing and revoking the API keys the [`@repo/wxt`](../wxt) browser extension authenticates with, reviewing the activity log of everything that has happened on their account, and downloading the extension build. Sign-up, sign-in, and session handling are delegated entirely to [`@repo/auth-server`](../auth-server) via `better-auth`'s client; this app holds no credentials of its own.

It also acts as its own backend-for-frontend: Next.js route handlers under `src/app/api` proxy `/api/auth/*` straight to `auth-server`, and proxy every other API call to [`@repo/nestjs`](../nestjs) after exchanging the caller's session cookie for a JWT (via `@repo/bff`'s token fetch and `@repo/proxy`). This keeps the browser dealing only in session cookies — it never sees a JWT or calls `nestjs` directly.
