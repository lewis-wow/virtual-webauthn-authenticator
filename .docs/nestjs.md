# NestJS

Used in `apps/nestjs`, the main authenticator API. Conventions below are observed in that app, not generic NestJS defaults.

## Contract-first controllers, not `@Get`/`@Post`

Routes are never declared with NestJS's own HTTP decorators. Every endpoint is defined once as a route in `@repo/contract` (a ts-rest contract) and implemented with `@TsRestHandler` + `tsRestHandler`:

```ts
@Controller()
@UseFilters(ExceptionFilter)
export class VirtualAuthenticatorsController {
  @TsRestHandler(nestjsContract.api.virtualAuthenticators.create)
  @UseGuards(AuthenticatedGuard)
  async createVirtualAuthenticator(@Jwt() jwtPayload: JwtPayload) {
    return tsRestHandler(nestjsContract.api.virtualAuthenticators.create, async ({ body }) => {
      // ...
      return { status: HttpStatusCode.OK_200, body: SomeResponseSchema[HttpStatusCode.OK_200].encode(result) };
    });
  }
}
```

This keeps request/response shapes identical across every consumer of the contract (see `apps/api-bff`, `apps/auth-server`, `apps/console`). When adding an endpoint, add it to the contract first, then implement it here — don't hand-roll a route.

## File naming: PascalCase + role suffix

Files are named `<Thing>.<role>.ts` (PascalCase, not kebab-case): `VirtualAuthenticators.controller.ts`, `Jwt.decorator.ts`, `Authenticated.guard.ts`, `Exception.filter.ts`, `Prisma.service.ts`, `AzureCredential.provider.ts`. Class names drop the dot and add the role as a suffix (`VirtualAuthenticatorsController`, `AuthenticatedGuard`). Follow this exactly — don't introduce kebab-case NestJS defaults (`virtual-authenticators.controller.ts`) into this app.

## Every controller applies the same exception filter

Controllers declare `@UseFilters(ExceptionFilter)` (from `src/filters/Exception.filter.ts`) at the class level. The filter normalizes anything thrown into the shared `Exception` type from `@repo/exception` (falling back to `InternalServerError`, and mapping `TsRestRequestValidationError` to `RequestValidationFailed`), logs it, then serializes `exception.toResponse()`. Domain errors should extend `Exception` (see `src/exceptions/*.ts`, e.g. `VirtualAuthenticatorNotFound`) rather than throwing raw NestJS `HttpException`s.

## Auth: guard + param decorator, not `req.user` directly

- `AuthenticatedGuard` (`src/guards/Authenticated.guard.ts`) checks `request.user` is present (populated upstream by `JwtMiddleware`) and throws `Unauthorized` from `@repo/exception/http` if not.
- The `@Jwt()` param decorator (`src/decorators/Jwt.decorator.ts`) pulls the typed `JwtPayload` off the request for use in the handler.
- Permission checks happen inside the handler body via `requirePermission(permissions, Permission['X.Y'])` (`src/utils/PermissionCheck.ts`), not in the guard — the guard only proves the caller is authenticated, not authorized for the specific action.

Apply `@UseGuards(AuthenticatedGuard)` per-handler (not globally), so unauthenticated endpoints like health checks stay reachable.

## Mutations: audit log + Prisma not-found mapping

Handlers that create/update/delete call `auditLog({ activityLog, action, entity, jwtPayload })` (`src/utils/AuditLog.ts`) after the write succeeds, using `LogAction`/`LogEntity` enums from `@repo/activity-log`. Prisma calls that can 404 are wrapped in `try/catch` and passed to `handlePrismaNotFoundError({ error, notFoundException })` (`src/utils/PrismaErrorHandler.ts`), which rethrows as the domain-specific `Exception` subclass if Prisma's error was a "record not found," or otherwise rethrows the original error.

## Module wiring

`app.module.ts` is one flat `AppModule` — no feature modules. New controllers/providers get registered directly in its `controllers`/`providers`/`exports` arrays. Middleware is applied in `configure()` (e.g. `JwtMiddleware` scoped to `/api`, `RequestIdMiddleware` scoped to `/`), not via decorators on controllers.

## Testing

Only integration tests exist for this app (`__tests__/vitest.integration.config.mts`), run with `pnpm --filter '@repo/nestjs' test:integration`. See [testing strategy](../AGENTS.md#testing) for the repo-wide convention.

## Docs

- llms.txt: https://docs.nestjs.com/llms.txt (full version: https://docs.nestjs.com/llms-full.txt)
- Official docs: https://docs.nestjs.com

If you need to do something with NestJS that isn't covered by the conventions above (a new decorator type, module-level DI patterns, lifecycle hooks, etc.), check the official docs linked above rather than guessing or inventing a pattern that doesn't match how this app already does things.
