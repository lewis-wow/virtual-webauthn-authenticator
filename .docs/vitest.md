# Vitest

Used across every `apps/*` and `packages/*` that has tests. This file covers the technical mechanics — shared config packages, why integration tests disable parallelism, coverage exclusion, and mocking/fake conventions. For the high-level `__tests__/unit` vs `__tests__/integration` split and which commands to run, see [AGENTS.md#testing](../AGENTS.md#testing) first — this file goes deeper, not wider.

## Shared config lives in `@repo/vitest-config`, not per-package options

`packages/vitest-config` exports two base configs and one constant via subpath exports:

```json
// packages/vitest-config/package.json
"exports": {
  "./unit": "./src/unit.ts",
  "./integration": "./src/integration.ts",
  "./consts": "./src/consts.ts"
}
```

`src/unit.ts` and `src/integration.ts` each call `defineConfig` with the `include` glob for that test kind (`__tests__/unit/**/*.{test,spec}.{ts,mts}` or `__tests__/integration/**/*.{test,spec}.{ts,mts}`), `excludeAfterRemap: true` coverage, and — only in `integration.ts` — `fileParallelism: false`. A package never rewrites these globs itself; it imports the base and merges in only what's package-specific:

```ts
// packages/virtual-authenticator/__tests__/vitest.unit.config.ts
import { unitConfig } from '@repo/vitest-config/unit';
import { defineConfig, mergeConfig } from 'vitest/config';
import pkg from '../package.json';

export default mergeConfig(
  unitConfig,
  defineConfig({
    test: { name: `${pkg.name}/unit`, root: join(import.meta.dirname, '..') },
  }),
);
```

`name` is always `${pkg.name}/unit` or `${pkg.name}/integration` (using the package's own `package.json`) — this is what shows up when Vitest reports results per-project. `root` is always the package directory (one level up from `__tests__/`), so relative paths inside the package's own config/`include` globs resolve correctly regardless of where Vitest was invoked from.

Packages needing more (e.g. `apps/nestjs`) merge in extra config on top rather than duplicating the base: `apps/nestjs/__tests__/vitest.integration.config.mts` adds `unplugin-swc` as a plugin (NestJS decorators need SWC's decorator metadata) and loads `.env.test` via `@dotenvx/dotenvx`, checking both the repo root and the app's own directory for the file.

Only add a config file for the kinds of tests a package actually has — a unit-only package (e.g. `packages/keys`, `packages/jwt`) has no `vitest.integration.config.ts`, and vice versa.

## Why integration tests set `fileParallelism: false`

`packages/vitest-config/src/integration.ts` hardcodes `fileParallelism: false` for every integration project, and the root `vitest.integration.config.ts` (and the combined `vitest.config.ts`, which runs both kinds together) set it again at the top level:

```ts
// vitest.integration.config.ts
export default defineConfig({
  test: {
    projects: ['**/__tests__/vitest.integration.config.{ts,mts}'],
    fileParallelism: false,
    coverage: { provider: 'v8', exclude: [...coverageConfigDefaults.exclude], include: ['**/src/**'] },
  },
});
```

Integration tests hit a single shared Postgres instance and a single shared Azure Key Vault mock (see below) — there is no per-test or per-file database isolation (no transactional rollback, no schema-per-worker). Running integration test files concurrently would let two files race on the same rows/keys and produce flaky failures that have nothing to do with the code under test. Disabling file parallelism serializes all integration test files (within a project and across the whole `projects` run), trading speed for correctness against shared, stateful infra. Unit tests have no such constraint — `unitConfig` leaves `fileParallelism` at Vitest's default (parallel).

## Coverage: v8 provider, shared exclude list, generated/barrel files excluded

Every config layer sets `coverage.provider: 'v8'`. The interesting part is `exclude`: `packages/vitest-config/src/consts.ts` exports `COVERAGE_EXCLUDE`, a single source of truth layered on top of Vitest's own `coverageConfigDefaults.exclude`:

```ts
// packages/vitest-config/src/consts.ts
export const COVERAGE_EXCLUDE = [
  '**/node_modules/**', '**/.pnpm/**', '**/dist/**',
  '**/__tests__/**',           // tests themselves
  '**/index.{ts,tsx}',         // barrel files
  '**/src/generated/**',       // generated code (e.g. Prisma client)
  '**/*.{tsx,jsx}',            // React components
  '**/packages/vitest-config/**', '**/packages/eslint-config/**',
  '**/packages/typescript-config/**', '**/packages/rollup-config/**',
  '**/packages/shared-dts/**', '**/types/**',
];
```

Both `unit.ts` and `integration.ts` spread `COVERAGE_EXCLUDE` in. The root `vitest.unit.config.ts` and `vitest.integration.config.ts` do **not** re-add it (each package's own project config already applies it via the base import), but the combined root `vitest.config.ts` imports `COVERAGE_EXCLUDE` directly and adds it again at the top level, since that file runs standalone rather than composing `unitConfig`/`integrationConfig`. When adding a new package that generates code (a Prisma client, a barrel `index.ts`, anything under `src/generated/`), rely on this list rather than hand-rolling per-package excludes — it's already broad enough to cover barrels, generated output, and the meta config packages that have no meaningful coverage of their own.

All coverage config uses `include: ['**/src/**']` — coverage is only ever collected for `src/`, never for `__tests__/` or root-level scripts.

## Test file naming and location

Test files are `*.test.ts` (the convention actually used; `*.spec.ts` is accepted by the `include` glob but not used in practice — check with `grep -rl '\.spec\.ts$'` before assuming otherwise). They live under `__tests__/unit/<mirror-of-src-path>/` or `__tests__/integration/`, never next to the source file. Imports reach back into `src/` with relative paths (e.g. `../../../../src/attestationHandlers/PackedAttestationHandler`), not via the package's own `@repo/x` export map — a package's own tests import its internals directly since the public `exports` map may deliberately not expose them.

## Mocking conventions

Three distinct patterns are used, pick the one matching the situation:

**1. Local `vi.fn()`-based mock factories for interfaces.** For a TypeScript interface with a handful of methods, define a small factory that returns an object literal implementing it, with every method as `vi.fn()`, and accept `overrides` for the test to customize:

```ts
// packages/virtual-authenticator/__tests__/unit/authenticator/attestationHandlers/PackedAttestationHandler.test.ts
const createMockKeyProvider = (overrides?: Partial<IKeyProvider>): IKeyProvider => ({
  generateKeyPair: vi.fn(),
  sign: vi.fn().mockResolvedValue({ signature: new Uint8Array([0x01, 0x02, 0x03]), alg: COSEKeyAlgorithm.ES256 }),
  ...overrides,
});
```

This keeps the mock's shape checked against the real interface (`IKeyProvider`) by the compiler, and every test file that needs a `IKeyProvider` double defines/reuses one of these rather than a bare `{} as any`.

**2. `vi.mock()` for third-party modules**, always with `importOriginal` to keep the rest of the module real and only stub the specific exports under test:

```ts
// packages/jwt/__tests__/unit/Jwt.test.ts
vi.mock('jose', async (importOriginal) => {
  const actual = await importOriginal<typeof jose>();
  return { ...actual, jwtVerify: vi.fn(), createLocalJWKSet: vi.fn() };
});
```

**3. Fake (in-memory) implementations of repository/provider interfaces, in `__tests__/helpers/`.** For interfaces that are exercised across many tests (not just stubbed for one assertion), the package writes a full fake class implementing the interface, backed by an in-memory array/map instead of `vi.fn()` stubs — this behaves like the real thing (state persists across calls within a test) without touching Postgres or the key vault:

```ts
// packages/virtual-authenticator/__tests__/helpers/InMemoryJwksRepository.ts
export class InMemoryJwksRepository implements IJwksRepository {
  private readonly keys: Jwk[] = [];

  async create(opts: JwksRepositoryCreateOptions): Promise<Jwk> {
    const jwk: Jwk = { id: randomUUID(), publicKey: opts.publicKey, privateKey: opts.privateKey };
    this.keys.push(jwk);
    return jwk;
  }

  async findLatest(): Promise<Jwk | null> {
    return this.keys.length === 0 ? null : this.keys[this.keys.length - 1]!;
  }

  async findAll(): Promise<Jwk[]> { return this.keys; }
}
```

`packages/virtual-authenticator/__tests__/helpers/` has several of these: `MockKeyProvider` (a real EC keypair generator + signer, implementing `IKeyProvider`, so attestation/assertion tests get cryptographically valid signatures without a real key vault), `MockVirtualAuthenticatorRepository` (implements `IVirtualAuthenticatorRepository`, always returns one fixed row), and `KeyVaultKeyIdGenerator` (a deterministic ID sequence helper). Despite the `Mock`-prefixed names, these are fakes (stateful, real logic), not `vi.fn()` stubs — don't confuse the naming with pattern 1 above.

Some packages publish their `__tests__/helpers` as a package export subpath so other packages can reuse the fakes instead of re-implementing them, e.g. `packages/keys/package.json` and `packages/jwt/package.json` both include `"./__tests__/helpers": "./__tests__/helpers/index.ts"` in `exports`.

## Integration tests: real Postgres + key vault mock, not mocked infra

Integration tests connect to the infra started by `./docker-compose-test.sh` (Postgres on `5432`, `lowkey-vault` — an Azure Key Vault emulator — on `3443`, and `assumed-identity` for credential flow on `3080`; see root `docker-compose.yml`). There is no test-only in-process DB: helpers instantiate the real client directly.

```ts
// apps/nestjs/__tests__/helpers/prisma.ts
import { PrismaClientExtended } from '@repo/prisma';
export const prisma = PrismaClientExtended.createInstance();
```

Other helpers in the same `__tests__/helpers/` folder are built on top of that real client — e.g. `apps/nestjs/__tests__/helpers/jwt.ts` wires a real `Jwks`/`Jwt`/`JwtIssuer` using `PrismaAuthJwksRepository` (from `@repo/jwks`) backed by the same `prisma` instance, so integration tests mint/verify real JWTs against real DB-stored keys instead of stubbing JWT verification. There is no global setup/teardown file resetting the schema between runs — combined with `fileParallelism: false`, tests within a package are expected to either use disposable data (unique IDs per test) or tolerate accumulating rows; check a package's `__tests__/integration/` tests for its specific cleanup approach (or lack of one) before assuming isolation exists.

Run infra before integration tests: `./docker-compose-test.sh`, then apply migrations with `pnpm --filter '@repo/prisma' db:migrate` (see [AGENTS.md](../AGENTS.md#commands)).

## Docs

- llms.txt: https://vitest.dev/llms.txt
- Official docs: https://vitest.dev/guide/

If you need something with Vitest that isn't covered here (snapshot testing, browser mode, benchmarking, etc.), check the docs above rather than guessing.
