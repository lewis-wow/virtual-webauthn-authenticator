# TypeScript

Applies repo-wide — every app in `apps/` and package in `packages/` is TypeScript, and the conventions below were checked against a cross-section of both (`packages/typescript-config`, `packages/utils`, `packages/http`, `packages/exception`, `packages/types`, `packages/virtual-authenticator`, `apps/nestjs`, `apps/console`, `apps/auth-server`).

## Shared base config, not per-package tsconfigs

`packages/typescript-config` is the single source of truth for compiler options. It publishes named configs via `package.json` `exports`, not a flat default:

```json
{
  "exports": {
    "./base.json": "./base.json",
    "./nestjs.json": "./nestjs.json",
    "./nextjs.json": "./nextjs.json",
    "./plasmo.json": "./plasmo.json",
    "./react-library.json": "./react-library.json"
  }
}
```

Everything else `extends` one of these instead of restating compiler options. Plain packages extend `base.json` directly (`packages/utils/tsconfig.json`, `packages/http/tsconfig.json`: `"extends": "@repo/typescript-config/base.json"`); framework apps extend the matching flavor (`apps/console/tsconfig.json` → `nextjs.json`, which itself extends `base.json`). There is **no root `tsconfig.json`** — each workspace member owns its own, all rooted in this shared base.

The one exception: `apps/nestjs/tsconfig.json` does not use `extends` — it inlines the full option set from `base.json` + `nestjs.json` by hand (and additionally sets `"verbatimModuleSyntax": false`, see below). Treat that as a known outlier, not the pattern to copy for a new package.

## Strict mode, no exceptions

`packages/typescript-config/base.json` turns on `strict` plus several checks stricter than `strict` alone requires:

```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "strictBindCallApply": true,
    "noImplicitAny": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

`noUncheckedIndexedAccess` in particular means any array/index/record lookup (`arr[i]`, `record[key]`) types as `T | undefined` — don't assume presence without a check or a non-null assertion you can justify. Every package/app config inherits this transitively; none of the surveyed configs turn it off.

## ESM everywhere, no `.js` import extensions

The repo root `package.json` sets `"type": "module"`, and every workspace package does the same (see `packages/utils/package.json`, `packages/http/package.json`). `base.json` pairs this with `"module": "ESNext"` and `"moduleResolution": "bundler"`, so relative imports are written **without** file extensions (`import { omitUndefined } from '@repo/utils'`, `from './validation/ExceptionShapeSchema'`) — grepping the whole source tree for `from './...js'` on relative imports returns zero hits. Don't add `.js` extensions to relative imports the way a `NodeNext`-resolution project would require.

## `import type` for type-only imports

`base.json` sets `"verbatimModuleSyntax": true`, which makes `tsc` itself enforce that type-only imports use `import type` (a plain `import` that's only used as a type is a compile error under this setting, since nothing gets elided implicitly). This shows up constantly in real code:

```ts
// packages/http/src/HttpStatusCode.ts
import type { ValueOfEnum } from '@repo/types';
```

```ts
// packages/exception/src/Exception.ts
import { ExceptionShapeSchema, type AnyExceptionShape } from './validation/ExceptionShapeSchema';
```

`apps/nestjs` is the one place that sets `"verbatimModuleSyntax": false` in its tsconfig, presumably because of `emitDecoratorMetadata`/decorator interactions — `import type` is still good style there, but it isn't compiler-enforced in that app the way it is everywhere else.

## Public API surface: `package.json` `exports`, not one flat barrel

Packages expose their public API through named subpaths in `package.json` `exports`, pointing straight at `src/*.ts` (no build step needed to consume them inside the monorepo). A minimal package has just `"."`:

```json
// packages/utils/package.json
{ "exports": { ".": "./src/index.ts" } }
```

A package with more than one logical concern splits into subpaths instead of dumping everything into the root export. `packages/virtual-authenticator/package.json` is the fullest example:

```json
{
  "exports": {
    ".": "./src/index.ts",
    "./browser": "./src/browser/index.ts",
    "./enums": "./src/enums/index.ts",
    "./exceptions": "./src/exceptions/index.ts",
    "./validation": "./src/validation/index.ts",
    "./types": "./src/types/index.ts",
    "./repositories": "./src/repositories/index.ts",
    "./cbor": "./src/cbor/index.ts",
    "./dto": "./src/dto/index.ts",
    "./state": "./src/state/index.ts",
    "./__tests__/helpers": "./__tests__/helpers/index.ts"
  }
}
```

The recurring subpath names across packages are `./enums`, `./validation`, `./exceptions`, `./dto`, and `./__tests__/helpers` (test fixtures deliberately exported for consumers, e.g. `packages/jwt`, `packages/keys`, `packages/pagination`, `packages/key-vault`). When adding a new concern to a package (a new enum, a new exception type), check whether it needs its own `exports` subpath rather than folding it into the default export or reaching into another package's `src/` directly. Consuming apps set `"resolvePackageJsonExports": true` (`packages/typescript-config/nestjs.json`) so `tsc` actually resolves these subpaths.

## Barrel `index.ts` files are generated, not hand-written

Root `.barrelsby.json` configures [barrelsby](https://www.npmjs.com/package/barrelsby) (`recursive`, `mode: "wild"`, excludes `*.spec.ts`/`*.test.ts`/`*.stories.tsx`), and `scripts/barrel.ts` wraps it: it runs barrelsby against a target directory, writing `<dir>/index.ts`, then prepends an `@file Automatically generated.` header comment. Packages whose `src/` has multiple subfolders wire this into their `build` script instead of maintaining `index.ts` by hand:

```json
// packages/virtual-authenticator-agent/package.json
{
  "scripts": {
    "build": "run-s barrel:root barrel:sub",
    "barrel:root": "../../scripts/barrel.ts",
    "barrel:sub": "run-p barrel:validation barrel:dto barrel:exceptions barrel:extensions barrel:helpers",
    "barrel:validation": "../../scripts/barrel.ts ./src/validation",
    "barrel:dto": "../../scripts/barrel.ts ./src/dto"
  }
}
```

`turbo.json` even declares these generated files as task `outputs` for cache correctness (e.g. `"@repo/virtual-authenticator-agent#build": { "outputs": ["src/index.ts", "src/dto/index.ts", ...] }`). If you add a new file to a directory that has a `barrel:*` script, don't hand-edit that directory's `index.ts` — run the build (or the specific `barrel:*` script) and let it regenerate. Simpler packages without subfolders (`packages/utils`, `packages/http`) still commit a hand-written `index.ts` of `export * from './X'` lines since there's nothing to regenerate.

## One export per file, filename matches the export

Across the surveyed packages, a source file almost always has a single primary export, and the filename is that export's identifier verbatim — camelCase for a function, PascalCase for a class/type/schema:

- `packages/utils/src/addPrefixToKeys.ts` exports `addPrefixToKeys`; `packages/utils/src/isNullish.ts` exports `isNullish`.
- `packages/types/src/ValueOfEnum.ts` exports the type `ValueOfEnum`; `packages/types/src/AddPrefix.ts` exports `AddPrefix`.
- `packages/exception/src/Exception.ts` exports the class `Exception`; `packages/http/src/HttpStatusCode.ts` exports `HttpStatusCode`.

This is the repo-wide rule. **`apps/nestjs`'s `<Thing>.<role>.ts` suffix convention** (`VirtualAuthenticators.controller.ts`, `Jwt.decorator.ts` — see [nestjs.md](./nestjs.md)) **is an app-specific refinement of this same base rule**, not a separate repo-wide convention — don't carry the `.controller`/`.provider`-style suffixes into non-NestJS packages, but do keep "filename == the thing it exports."

## Types derived from Zod schemas, not hand-duplicated

Where a runtime shape is validated with Zod, the corresponding TypeScript type is derived with `z.infer` rather than declared separately (63+ occurrences across the workspace), e.g. `packages/virtual-authenticator/src/state/StateTokenPayloadSchema.ts`: `export type StateTokenPayload = z.infer<typeof StateTokenPayloadSchema>;`. See [zod.md](./zod.md) for the schema-authoring conventions themselves.

## Errors extend a shared `Exception` base

`@repo/exception`'s `Exception` class (`packages/exception/src/Exception.ts`) is the common base for thrown errors across the codebase (subclassed per-domain, e.g. `packages/virtual-authenticator/src/exceptions/*`), rather than throwing plain `Error` or framework-specific exception types directly — see [nestjs.md](./nestjs.md) for how `apps/nestjs` wires it into a global exception filter.

## `check-types` is `tsc --noEmit`, orchestrated by Turborepo

Every package/app defines `"check-types": "tsc --noEmit"` in its own `package.json` (e.g. `packages/exception/package.json`). The root `pnpm check-types` runs `turbo run check-types`, and `turbo.json` declares `"check-types": { "dependsOn": ["^check-types"] }` so a package's dependencies are type-checked first. Scope to one package during development with `pnpm check-types --filter <package-name>` rather than waiting on the whole graph.

## Docs

- Official docs: https://www.typescriptlang.org/docs/

TypeScript does not publish an official `llms.txt` (verified: `https://www.typescriptlang.org/llms.txt` returns 404) — if you need something not covered by the conventions above, check the official docs linked above rather than guessing.
