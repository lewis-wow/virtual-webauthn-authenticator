# Agent Instructions

Server-side WebAuthn authenticator thesis project. pnpm + Turborepo monorepo: `apps/`, `packages/`, `examples/`. See [README.md](./README.md) for what the project is and how to run it end to end, and each app/package's own `README.md` for what that specific piece does and why it exists.

## Commands

Run from the repo root. Most accept `--filter <package-name>` to scope to one workspace member (e.g. `pnpm build --filter @repo/nestjs`).

- `pnpm build` — Build all apps/packages (Turborepo, dependency-ordered).
- `pnpm dev` — Run all apps/packages in dev/watch mode.
- `pnpm start` — Run all apps/packages in production mode (requires `pnpm build` first).
- `pnpm lint` — Lint all apps/packages.
- `pnpm check-types` — Type-check all apps/packages (`tsc --noEmit`).
- `pnpm format` / `pnpm format:check` — Prettier write / check across `.ts`, `.tsx`, `.md`.
- `pnpm test` — Run the full Vitest suite (unit + integration) across the monorepo.
- `pnpm test:unit` — Run only unit tests.
- `pnpm test:integration` — Run only integration tests.
- `pnpm test:*:coverage` — Same as above, with V8 coverage collected.
- `pnpm test:ui` — Open the Vitest UI.
- `pnpm coverage:latex` — Render `coverage/coverage-final.json` into a LaTeX table (thesis docs).
- `pnpm openapi:latex` — Render the generated OpenAPI spec into LaTeX (thesis docs).
- `pnpm docs:toc` — Regenerate the table of contents in the root `README.md`.
- `pnpm changeset` — Interactively record a change: pick which package(s) changed, the bump type, and a summary. Run this on any PR that should trigger a version bump; writes a markdown file under `.changeset/`.
- `pnpm changeset:status` — Read-only preview of what the pending `.changeset/*.md` files would bump, including cascaded internal dependents. Safe to run any time, changes nothing.
- `pnpm changeset:version` — Consumes pending changesets: bumps `package.json` versions, regenerates `CHANGELOG.md`s, deletes the consumed changeset files. Used by `.github/workflows/version.yml`'s "Version Packages" PR — not normally run by hand.
- `pnpm release` — `changeset publish` (no-ops; every package here is private) followed by `scripts/tag_app_releases.ts`, which tags and pushes `<app>/vX.Y.Z` for whichever Dockerfile-bearing app(s) just got a new version. Used by `.github/workflows/version.yml` after a Version Packages PR is merged — not normally run by hand.

Infrastructure (Postgres + a local Azure Key Vault mock) is started separately with `./docker-compose-test.sh`. Database migrations run via `pnpm --filter '@repo/prisma' db:migrate`.

## Before finishing

`pnpm build`, `pnpm lint`, `pnpm check-types`, `pnpm format:check`, `pnpm test:unit`, and `pnpm test:integration` (equivalently, `pnpm test`) must all pass after any change, before considering the work done. Scope them to the affected package(s) with `--filter` while iterating, but do a final unscoped run before finishing — a change in one package can break a consumer elsewhere in the graph.

## Testing

Tests live next to the code they cover, in each app/package's own `__tests__/` folder, split by kind:

- `__tests__/unit/` + `__tests__/vitest.unit.config.ts` — unit tests, no external dependencies.
- `__tests__/integration/` + `__tests__/vitest.integration.config.ts` — integration tests, exercised against the real infra (Postgres, key vault mock) started by `docker-compose-test.sh`.
- `__tests__/helpers/` — shared fixtures/mocks local to that package (e.g. in-memory repository implementations, test data builders).

Not every package has both kinds — a package only gets the config file(s) for the kinds of tests it actually has. The root `vitest.config.ts` / `vitest.unit.config.ts` / `vitest.integration.config.ts` each glob for the matching `__tests__/vitest.*.config.{ts,mts}` across the whole monorepo as Vitest "projects," so `pnpm test` / `test:unit` / `test:integration` run everything in one pass. Run a single package's tests with `pnpm --filter <package-name> test:unit` (or `test:integration`) instead of scoping the root command.

## Writing style for docs, ADRs, specs, and issues

When writing ADRs, specs, issues, or any other project documentation:

- Use bullet points for all lists, decisions, options, and rationale — avoid long paragraphs.
- Keep sentences short and direct; one idea per bullet.
- Use plain English — no jargon unless it is a defined term in this project's domain.
- State the "what" and "why" explicitly; skip filler phrases ("it should be noted that…", "in order to…").
- Prefer concrete nouns over abstract ones ("the credential store" not "the relevant component").

## Framework & tool conventions

Best practices actually observed in this codebase, one file per topic. Before writing or changing code that touches one of these frameworks/tools, read its file first. Each one also links to that tool's official docs (and `llms.txt` where the tool publishes one) — if you need something the file below doesn't cover, go there rather than guessing.

- [TypeScript](.docs/typescript.md)
- [NestJS](.docs/nestjs.md)
- [Hono](.docs/hono.md)
- [Better Auth](.docs/better-auth.md)
- [Prisma](.docs/prisma.md)
- [React Hook Form](.docs/react-hook-form.md)
- [Zod](.docs/zod.md)
- [shadcn/ui](.docs/shadcn.md)
- [Next.js](.docs/nextjs.md)
- [WXT](.docs/wxt.md)
- [Vitest](.docs/vitest.md)
- [Monorepo (pnpm + Turborepo)](.docs/monorepo.md)
