# Prisma

`@repo/prisma` (`packages/prisma`) is the single shared Prisma package. It owns the schema, migrations, generated client, and the Prisma error-code enum; every app/package that talks to Postgres depends on it rather than defining its own client. Conventions below are observed in this codebase, not generic Prisma defaults.

## Schema lives at a custom path and generates into `src/generated`

The schema is `packages/prisma/src/schema.prisma` (not the default `prisma/schema.prisma`), configured via `packages/prisma/prisma.config.ts`:

```ts
export default defineConfig({
  schema: join('src', 'schema.prisma'),
  migrations: { path: join('src', 'migrations') },
  views: { path: join('src', 'views') },
  typedSql: { path: join('src', 'queries') },
});
```

The `generator client` block generates the client into a custom in-repo location instead of `node_modules/.prisma`:

```prisma
generator client {
  provider               = "prisma-client"
  output                 = "generated/client"
  moduleFormat           = "esm"
  generatedFileExtension = "ts"
  importFileExtension    = "ts"
  binaryTargets          = ["native", "linux-musl-arm64-openssl-3.0.x"]
}
```

That resolves to `packages/prisma/src/generated/client/**`, matching the special `@repo/prisma#build` task in root `turbo.json` (`outputs: ["src/generated/client/**"]` — every other package's `build` task outputs `dist/**`/`generated/**`/`build/**`). Running `pnpm build --filter @repo/prisma` (which runs `prisma generate`) is what produces this directory; it's gitignored, so a fresh checkout has no client until build/generate runs.

## The client is re-exported, never imported from the generated path directly

`packages/prisma/src/index.ts` re-exports both the hand-written extension wrapper and the generated client barrel:

```ts
export * from './client';
export * from './generated/client/client';
```

Consumers import `PrismaClient`, `Prisma` (the namespace, e.g. `Prisma.PrismaClientKnownRequestError`), and model types from `@repo/prisma` — never reach into `@repo/prisma/src/generated/...`. The package also exposes `@repo/prisma/enums` (`packages/prisma/src/enums/index.ts`) for `PrismaErrorCode`, a hand-maintained map of every Prisma error code (`P1000`–`P6010`) to a doc comment linking the official error reference, e.g. `RECORDS_NOT_FOUND: 'P2025'`.

`packages/prisma/src/client.ts` wraps client construction with a Next.js-style dev singleton and the Accelerate extension:

```ts
export class PrismaClientExtended {
  static createInstance(): PrismaClient {
    const globalForPrisma = global as unknown as { prisma: PrismaClient };
    const prisma = globalForPrisma.prisma || new PrismaClient().$extends(withAccelerate());
    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
    return prisma;
  }
}
```

Use `PrismaClientExtended.createInstance()` wherever a standalone client is needed outside of NestJS DI (e.g. `apps/nestjs/__tests__/helpers/prisma.ts` builds its shared test client this way).

## NestJS: `PrismaService` extends `PrismaClient`, connects in `onModuleInit`

`apps/nestjs/src/services/Prisma.service.ts`:

```ts
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

It is registered as a provider in `app.module.ts` like any other service (see [NestJS conventions](./nestjs.md) — no feature modules). It is *not* used directly in controllers or business logic.

## Prisma is an implementation detail behind a repository interface

Prisma access is wrapped in repository classes that live in the domain package (`packages/virtual-authenticator`), not in `apps/nestjs`. Each repository has an interface plus a `Prisma*` implementation, e.g. `packages/virtual-authenticator/src/repositories/webAuthnPublicKeyRepository/`:

- `IWebAuthnRepository.ts` — the interface (`createKeyVaultWebAuthnPublicKeyCredential`, `findAllByRpIdAndCredentialIds`, `incrementCounter`, `findFirstAndIncrementCounterAtomicallyOrThrow`, ...), expressed purely in domain types.
- `PrismaWebAuthnRepository.ts` — implements `IWebAuthnRepository` against a `PrismaClient` passed into its constructor (`constructor(opts: { prisma: PrismaClient })`). All `this.prisma.<model>.*` calls, `$transaction`, `Prisma.PrismaClientKnownRequestError` handling, and error-code checks (e.g. `P2003` foreign-key failures mapped to `UserNotExists`/`ApiKeyNotExists`) live here.

Same pattern for `PrismaVirtualAuthenticatorRepository` and `PrismaVirtualAuthenticatorJwksRepository` (`packages/virtual-authenticator/src/repositories/virtualAuthenticatorRepository/` and `.../jwksRepository/`). Because business logic depends on the `I*Repository` interface, Prisma can be swapped for an in-memory fake in unit tests (see `packages/virtual-authenticator/__tests__/helpers/MockVirtualAuthenticatorRepository.ts`, `InMemoryJwksRepository.ts`) without touching a real database.

`apps/nestjs` only wires the concrete Prisma implementation into Nest's DI container via thin `useFactory` providers, e.g. `apps/nestjs/src/services/PrismaWebAuthnRepository.provider.ts`:

```ts
export const PrismaWebAuthnRepositoryProvider: Provider = {
  provide: PrismaWebAuthnRepository,
  useFactory: (prisma: PrismaService) => new PrismaWebAuthnRepository({ prisma }),
  inject: [PrismaService],
};
```

`PrismaVirtualAuthenticatorRepository.provider.ts` and `PrismaVirtualAuthenticatorJwksRepository.provider.ts` follow the identical shape. Never call `this.prisma.<model>` directly from a controller or a new business-logic class — add a method to the relevant repository interface/implementation instead, and inject the repository (not `PrismaService`).

## Not-found errors: `handlePrismaNotFoundError`

`apps/nestjs/src/utils/PrismaErrorHandler.ts` centralizes mapping Prisma's P2025 ("An operation failed because it depends on one or more records that were required but not found") to a domain `Exception`:

```ts
export const handlePrismaNotFoundError = (opts: {
  error: unknown;
  notFoundException: Exception;
}): void => {
  const { error, notFoundException } = opts;
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === PrismaErrorCode.RECORDS_NOT_FOUND) {
      throw notFoundException;
    }
  }
};
```

Call-site pattern for Prisma calls that can 404 (e.g. `delete`/`update` on a missing row): wrap in `try/catch`, call `handlePrismaNotFoundError({ error, notFoundException: new XyzNotFound() })`, then rethrow the original error so any other Prisma error still propagates. Domain-specific foreign-key violations (like the `P2003` handling in `PrismaWebAuthnRepository.createKeyVaultWebAuthnPublicKeyCredential`) are handled ad hoc inside the repository method itself rather than through this shared helper, since the resulting exception depends on which field failed (`meta?.constraint`).

## Migrations

Scripts in `packages/prisma/package.json`, all run through `dotenvx` (`../../scripts/dotenvx.sh`) to load env vars:

- `db:generate` — `prisma migrate dev` (create + apply a migration from local schema changes, dev only).
- `db:migrate` — `prisma migrate deploy` (apply pending migrations, no schema diffing; this is the one run in CI/environments — see root `AGENTS.md` and `README.md`: `pnpm --filter '@repo/prisma' db:migrate`).
- `db:push` — `prisma db push` (schema sync without a migration file).
- `db:studio` — `prisma studio`.
- `db:reset` — `prisma migrate reset`.

Migration SQL files live under `packages/prisma/src/migrations/<timestamp>_<name>/migration.sql` (per `prisma.config.ts`'s custom `migrations.path`), e.g. `20260506083737_rp_prefix`. Local Postgres for migrations/tests is started with `./docker-compose-test.sh` at the repo root (`docker compose up postgres assumed-identity lowkey-vault -d --wait`), which also brings up the Azure Key Vault mocks used elsewhere in the stack.

## Tests: a shared real Prisma client, not a mocked one

Integration tests don't mock Prisma — they run against the real Postgres started by `docker-compose-test.sh`. `apps/nestjs/__tests__/helpers/prisma.ts` is the single shared client instance for the whole test app:

```ts
import { PrismaClientExtended } from '@repo/prisma';
export const prisma = PrismaClientExtended.createInstance();
```

Test suites override Nest's DI to use this instance instead of letting `PrismaService` create its own connection: `Test.createTestingModule({...}).overrideProvider(PrismaService).useValue(prisma)`. Test data is seeded/cleaned with small `upsertTesting*`/cleanup helpers exported from the owning package's `__tests__/helpers` (e.g. `@repo/virtual-authenticator/__tests__/helpers` exports `upsertTestingVirtualAuthenticator`, `upsertTestingWebAuthnPublicKeyCredential`), each taking `{ prisma }` and using `prisma.<model>.upsert(...)` with fixed IDs/dates so tests are deterministic. `afterAll` hooks tear down with `prisma.<model>.deleteMany()` calls (grouped in a `prisma.$transaction([...])` when multiple related tables must be cleared together, e.g. `cleanupWebAuthnPublicKeyCredentials` in `PublicKeyCredential.get.test.ts`). See [Vitest conventions](./vitest.md) and the [testing strategy](../AGENTS.md#testing) for how these fit into the unit/integration split.

## Docs

- llms.txt: https://www.prisma.io/llms.txt
- Official docs: https://www.prisma.io/docs

If you need to do something with Prisma that isn't covered by the conventions above (schema modeling features, query API details, connection pooling, etc.), check the official docs linked above rather than guessing or inventing a pattern that doesn't match how this repo already does things.
