# Hono

Used in `apps/api-bff` (a pure reverse-proxy service) and `apps/auth-server` (the Better Auth + API-key host). Both are thin Hono apps that sit in front of the main `apps/nestjs` API. Conventions below are observed in those two apps, not generic Hono defaults.

## No `@ts-rest/hono` — contracts are consumed as plain data

Unlike `apps/nestjs` (which wires `@repo/contract` routes with `@TsRestHandler`/`tsRestHandler`), neither Hono app depends on a ts-rest server adapter. Instead, a contract endpoint's `method`/`path`/`pathParams`/`body` fields are read directly and handed to Hono's own routing/validation APIs:

```ts
// apps/auth-server/src/routes/api-keys.ts
apiKey.put(
  authServerContract.api.auth.apiKeys.update.path,
  requireAuthMiddleware,
  sValidator('param', authServerContract.api.auth.apiKeys.update.pathParams),
  sValidator('json', authServerContract.api.auth.apiKeys.update.body),
  async (ctx) => {
    /* ... */
  },
);
```

When the HTTP method itself needs to come from the contract (rather than being hardcoded as `.get`/`.post`/etc.), use `app.on([contract.method], contract.path, ...)`:

```ts
apiKey.on(
  [authServerContract.api.auth.apiKeys.getToken.method],
  authServerContract.api.auth.apiKeys.getToken.path,
  async (ctx) => { /* ... */ },
);
```

Always take the path (and body/param/query schemas) from `@repo/contract` — never hand-write a route string or re-declare a validation schema that already exists in the contract. Response bodies are built from the same contract DTO schema referenced in `responses`, using Zod 4's `.encode(...)` (e.g. `ctx.json(GetTokenApiKeyResponseSchema.encode({ token }))`), the same encode step used in `apps/nestjs`.

`apps/api-bff` doesn't implement any contract endpoints at all — see the next section.

## `api-bff` is a proxy, not a REST API

`apps/api-bff/src/index.ts` has exactly one route, `app.all('/api/*', ...)` (pattern from `API_ROUTE_PATTERN` in `src/constants.ts`), which:

1. Reads the `Authorization` header and extracts an API key with `tryFromBearerToken` (`@repo/auth`).
2. If present, exchanges it for a short-lived JWT via `tokenFetch.fetchToken({ apiKey })` (a `TokenFetch` from `@repo/bff`, configured in `src/container.ts` to call `auth-server`'s `/api/auth/api-keys/token` endpoint).
3. Forwards the original request to `apps/nestjs` with `proxy(env.API_BASE_URL, ctx.req.raw, { headers: { Authorization: jwt ? toBearerToken(jwt) : null } })` from `@repo/proxy`.

`apps/console`'s own Next.js route handler (`apps/console/src/app/api/[[...all]]/route.ts`) does the same API-key→JWT-exchange-then-proxy dance using the same `@repo/proxy` + `@repo/bff` `TokenFetch` primitives (just swapping the API-key lookup for a Better Auth session-cookie lookup). Treat "proxy + token exchange" as a reusable pattern built on `@repo/proxy`/`@repo/bff`, not something to reimplement per app.

## App wiring: `factory.ts` + `container.ts`, one per app

Both apps follow the same three-file skeleton:

- **`container.ts`** — a `DependencyContainer` (`@repo/dependency-container`) registering that app's services (logger, `jwtIssuer`, `apiKeyManager`, `auth` (Better Auth instance), `tokenFetch`, etc.), mirroring the DI-registration style used in `apps/nestjs`'s module, but manual instead of decorator-based.
- **`factory.ts`** — `createFactory<{ Variables: {...} }>()` from `hono/factory`, which (a) injects the container into every request via `app.use((ctx, next) => { ctx.set('container', container); ... })`, and (b) installs the global error handler (see below). `apps/auth-server`'s factory additionally types `user`/`session` Variables off `container.$dependencies.auth.$Infer.Session`.
- **`index.ts`** (and `routes/index.ts` for `auth-server`) — assembles the app from `factory.createApp()`, mounts sub-routers with `app.route('/', subRouter)`, and calls `serve({ fetch: app.fetch, port: env.PORT }, ...)` from `@hono/node-server`.

Access services in a handler via `ctx.get('container').resolve('serviceName')` — never import a singleton directly into a route file.

## Error handling: same `@repo/exception` contract as NestJS, wired via `onError`

Both `factory.ts` files register a single global handler instead of NestJS's per-controller `@UseFilters(ExceptionFilter)`:

```ts
// apps/api-bff/src/factory.ts (identical in apps/auth-server/src/factory.ts)
app.onError((error, ctx) => {
  const logger = ctx.get('container').resolve('logger');
  logger.exception(error);

  const exception = error instanceof Exception ? error : new InternalServerError();

  return exception.toResponse();
});
```

Route/middleware code throws domain or HTTP exceptions from `@repo/exception` directly — e.g. `throw new Unauthorized({ message: 'API key is invalid.' })` (`apps/auth-server/src/routes/api-keys.ts`) or `throw new Unauthorized()` from a middleware (`requireAuthMiddleware.ts`) — and lets them bubble to `onError`. Don't `try/catch` + manually build a `Response` in a handler; throw and let the factory's `onError` serialize it via `exception.toResponse()`.

## Request validation: `@hono/standard-validator`, not `zValidator`

Both apps use `sValidator` from `@hono/standard-validator` (Standard Schema, so it works with the Zod 4 schemas exported by `@repo/contract` without an adapter):

```ts
sValidator('json', authServerContract.api.auth.apiKeys.create.body);
sValidator('param', authServerContract.api.auth.apiKeys.get.pathParams);
```

Read the validated data with `ctx.req.valid('json')` / `ctx.req.valid('param')` — never re-parse `await ctx.req.json()` by hand in a route that already has a validator attached.

## Typed middleware via `factory.createMiddleware`

Custom middleware (e.g. `apps/auth-server/src/middlewares/requireAuthMiddleware.ts`) is created with `factory.createMiddleware((ctx, next) => { ... })` rather than a bare `(ctx, next) => {}` function, so it picks up the app's typed `Variables` (`ctx.var.user`, `ctx.var.session`, `ctx.get('container')`):

```ts
export const requireAuthMiddleware = factory.createMiddleware((ctx, next) => {
  if (ctx.var.session === null || ctx.var.user === null) {
    throw new Unauthorized();
  }
  return next();
});
```

Session/user population itself happens once, globally, in `auth-server`'s `routes/index.ts` via `app.use('*', async (ctx, next) => { ... auth.api.getSession(...) ... })`, which is what `requireAuthMiddleware` and route handlers (`ctx.var.user!.id`) rely on downstream.

## Logging middleware

`apps/api-bff` (and `apps/console`'s proxy route handler) log request/response pairs with `RequestLogFormatter` from `@repo/bff`:

```ts
app.use(async (ctx, next) => {
  const logger = ctx.get('container').resolve('logger');
  logger.debug('Request', RequestLogFormatter.logRequestInfo({ request: ctx.req.raw }));
  await next();
  logger.debug('Response', RequestLogFormatter.logResponseInfo({ request: ctx.req.raw, response: ctx.res }));
});
```

Reuse `RequestLogFormatter` for this rather than hand-rolling request/response log lines.

## File naming

Unlike `apps/nestjs`'s PascalCase-with-role-suffix convention (`Exception.filter.ts`), the Hono apps use plain camelCase/kebab-case: `container.ts`, `factory.ts`, `env.ts`, `requireAuthMiddleware.ts`, `api-keys.ts` (route files are named after the resource, kebab-case). Don't import the NestJS app's naming convention into these apps.

## Docs

- llms.txt: https://hono.dev/llms.txt
- Official docs: https://hono.dev/docs

If you need to do something with Hono that isn't covered by the conventions above (a new middleware type, streaming responses, RPC client generation, etc.), check the official docs linked above rather than guessing or inventing a pattern that doesn't match how these apps already do things.
