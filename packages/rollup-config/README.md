# @repo/rollup-config

It exists so the standalone Node services in this monorepo (`apps/auth-server`, `apps/api-bff`) don't each hand-roll a Rollup pipeline for turning their TypeScript entrypoint into a runnable bundle. It exports a single `createRollupConfig()` factory that each app's `rollup.config.js` calls with its `input` path.

The factory wires up SWC for TypeScript transpilation, resolves `tsconfig` path aliases, converts CommonJS deps to ESM, and bundles everything except `@repo/*` workspace packages (which are explicitly excluded from externalization so they get inlined) into an ESM `dist/` output. In watch mode it also re-runs the built bundle on change via `@rollup/plugin-run`, giving those apps a `rollup -c --watch` dev loop.
