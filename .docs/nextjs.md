# Next.js

Used in `apps/console` (Next.js 15, App Router, React 19 — the admin console, the real product) and `examples/nextjs` (a minimal relying-party demo app). Conventions below are observed in those two apps, not generic Next.js defaults. Both are structurally very similar (same `next.config.ts` shape, same `Providers.tsx` + `layout.tsx` wiring, same shadcn/`@repo/ui` usage); differences are called out explicitly where they matter.

## Route: thin server `page.tsx` + a real page component in `src/components/pages`

`app/**/page.tsx` files are not where page logic lives. Each one is a thin default export that renders an `AuthGuard` (for protected routes) around a real implementation component imported from `src/components/pages/<Name>Page.tsx`:

```tsx
// apps/console/src/app/virtual-authenticators/page.tsx
import { AuthGuard } from '@/components/AuthGuard';
import { VirtualAuthenticatorsPage } from '@/components/pages/VirtualAuthenticatorsPage';

export default () => {
  return (
    <AuthGuard requireAuthState="authenticated">
      <VirtualAuthenticatorsPage />
    </AuthGuard>
  );
};
```

Unauthenticated-only routes (sign-in, sign-up) use `requireAuthState="unauthenticated"` the same way (`apps/console/src/app/auth/signin/page.tsx`). `examples/nextjs` doesn't have an `AuthGuard` — its `page.tsx` files (`src/app/page.tsx`, `src/app/profile/passkeys/page.tsx`) just export the real component directly. When adding a route, put the actual UI/logic in `src/components/pages/`, not inline in `page.tsx`.

## Server vs. client components: page.tsx stays a server component, the boundary starts where hooks are needed

Most `page.tsx` files have no `'use client'` directive — they're server components that simply compose client components (`AuthGuard`, the `*Page` component) as children. React only needs the directive at the actual client boundary; everything below it (`Header.tsx`, `LogEntityIcon.tsx`, etc.) is a plain presentational component with no directive of its own, since it's already inside a client subtree. Don't add `'use client'` to every file by habit — only where a component uses hooks, state, or browser APIs (data fetching hooks, `useForm`, `useRouter`, event handlers). See `apps/console/src/components/pages/VirtualAuthenticatorsPage.tsx` (`'use client'`, uses `useForm`/`$api` hooks) vs. `apps/console/src/components/Page/Header.tsx` (no directive, pure presentational).

The root `layout.tsx` in both apps is a plain server component; `Providers.tsx` (imported into it) is the `'use client'` boundary that wraps `children` in `QueryClientProvider` / ts-rest's `ReactQueryProvider` (console) or is currently a no-op passthrough (`examples/nextjs`).

## Data fetching: ts-rest + TanStack Query client hooks, no server components/actions for data

All data fetching in `apps/console` goes through `$api` (`src/lib/tsr.ts`), a ts-rest React Query client built from the shared `@repo/contract` (merging `nestjsContract.api` and `authServerContract.api`) via `initTsrReactQuery`. Pages call `$api.api.<resource>.<action>.useQuery(...)` / `.useMutation(...)` inside client components — see `VirtualAuthenticatorsPage.tsx` and `ApiKeysPage.tsx` for the pattern: `useQuery` with an explicit `queryKey` array (`['api', 'virtualAuthenticators', 'list']`), mutations that call `queryClient.invalidateQueries` with the same key on success, and `toast.success`/`toast.error` (sonner) for feedback. There are no Server Components fetching data and no Next.js Server Actions anywhere in either app — everything is client-side query/mutation hooks. `apps/console/src/lib/getQueryClient.ts` follows the standard TanStack SSR-safe singleton pattern (`isServer` check, one client per request on the server, one cached client in the browser) and configures a shared `MutationCache` that invalidates the logs list on every successful mutation (for the activity log to stay fresh).

`examples/nextjs` is simpler and doesn't use ts-rest at all — it calls `better-auth`'s client directly (`useSession`, `signIn.email`, `passkey.addPasskey`, etc. from `src/lib/auth-client.ts`) inside `'use client'` components, with plain `useState`/`try/catch` for loading and error state (see `src/components/login-form.tsx`, `src/components/passkey-auth.tsx`).

## Talking to the backend: same-origin API routes that proxy to the real services

Neither app calls the backend origin directly from the browser. Both define catch-all Route Handlers under `src/app/api/**/[...segment]/route.ts` that forward the incoming `Request` to the real backend using `@repo/proxy`'s `proxy()` helper, so the browser only ever talks to same-origin `/api/*`:

- `apps/console/src/app/api/auth/[...all]/route.ts` proxies everything under `/api/auth` to `env.AUTH_BASE_URL` (the auth server).
- `apps/console/src/app/api/[[...all]]/route.ts` proxies everything else to the NestJS API (`http://localhost:3001`), and additionally reads the `session_token` cookie, exchanges it for a JWT via `container.resolve('tokenFetch')`, and injects it as `Authorization: Bearer <jwt>` — the browser never sees or handles the JWT directly.

Both handlers export `GET`/`POST`/`PUT`/`DELETE` bound to the same async `handler`, and log request/response info via `@repo/bff`'s `RequestLogFormatter`. `examples/nextjs/src/app/api/auth/[...all]/route.ts` instead uses better-auth's own `toNextJsHandler(auth)` directly (it hosts its own auth server in-process via Prisma + SQLite, so there's nothing to proxy).

`apps/console/src/container.ts` sets up a small `DependencyContainer` (`@repo/dependency-container`) providing `logger`, `authClient`, and `tokenFetch` — the same DI style used elsewhere in the monorepo (see `.docs/nestjs.md`), just applied at the Next.js app level instead of a NestJS module. `getBaseUrl()` (`src/lib/getBaseUrl.ts`) returns `''` in the browser (relative paths) and `http://localhost:<PORT>` on the server, since server-side ts-rest calls need an absolute URL.

## Env vars: `@repo/env-config` in console, raw `process.env` in the demo

`apps/console/src/env.ts` defines and validates env vars with `@repo/env-config`'s `defineEnv`, splitting `server` (never exposed to the browser: `PORT`, `BASE_URL`, `API_BASE_URL`, `AUTH_BASE_URL`, etc.) from `client` (must be prefixed `NEXT_PUBLIC_`, e.g. `NEXT_PUBLIC_API_BASE_URL`), matching Next.js's own public/private env var split. Import `env` from `@/env` rather than reading `process.env` directly in server code. `examples/nextjs` has no `@repo/env-config` dependency and reads `process.env.NEXT_PUBLIC_BETTER_AUTH_URL` / `process.env.BETTER_AUTH_URL` straight from `src/lib/auth-client.ts` / `src/lib/auth.ts` — appropriate for a minimal demo app, but don't copy that pattern into `apps/console`.

## `next.config.ts`: minimal, no custom webpack/rewrites

Both apps have effectively the same tiny config: `transpilePackages: ['@repo/ui']` (since `@repo/ui` ships TS/TSX source, not a pre-built bundle) and `devIndicators: false`. `apps/console` additionally sets `output: 'standalone'` for its Docker deployment. Neither app configures `rewrites()`/`redirects()` — cross-service routing goes through the `api/**/route.ts` proxy handlers described above, not Next.js rewrites. There is no `middleware.ts` in either app — auth gating is done client-side via `AuthGuard`, not edge middleware.

## Auth guard pattern: query the profile, redirect via `useRouter`, no middleware

`apps/console/src/components/AuthGuard.tsx` is the only route-protection mechanism: it runs `$api.api.profile.get.useQuery(...)`, derives `isAuthenticated` from the response, and `useEffect`s a `router.push('/auth/signin')` or `router.push('/')` depending on the `requireAuthState` prop and the fetch result, showing the shared `Guard` (`@repo/ui/components/Guard/Guard`) spinner while fetching or redirecting. Sign-out (`apps/console/src/hooks/useSignOut.ts`) calls `authClient.signOut()`, seeds the profile query cache with `null` via `queryClient.setQueryData`, then pushes to `/auth/signin`. `examples/nextjs` does the equivalent inline per-page with `useSession()` + a plain `if (!session) { router.push(...); return null; }` (see `src/app/profile/passkeys/page.tsx`) rather than a shared guard component — reasonable for its two protected routes, but `apps/console`'s shared `AuthGuard` is the pattern to extend if console gains more protected routes.

## Docs

- llms.txt: https://nextjs.org/llms.txt
- Official docs: https://nextjs.org/docs

If you need to do something with Next.js that isn't covered above (parallel routes, `generateStaticParams`, image optimization, caching directives, etc.), check the official docs linked above rather than guessing or inventing a pattern that doesn't match how these two apps already work.
