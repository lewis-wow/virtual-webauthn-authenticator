# @repo/vitest-config

It exists so every package's Vitest setup — test globs, coverage provider, exclude patterns — is defined once instead of copy-pasted across the monorepo. Packages import `unitConfig` or `integrationConfig` from this package and pass them to `defineConfig`/`mergeConfig` in their own `vitest.config.ts`.

It exports two ready-made configs (`./unit`, pointed at `__tests__/unit`, and `./integration`, pointed at `__tests__/integration` with `fileParallelism` disabled), plus a `COVERAGE_EXCLUDE` constant (`./consts`) listing the paths — generated code, barrel files, config packages, etc. — that should never count toward coverage. See `.docs/vitest.md` for the full testing conventions this config supports.
