# @repo/typescript-config

It exists so every package and app in the monorepo compiles with the same strictness settings instead of each one drifting on its own `tsconfig.json`. `base.json` is the shared foundation (strict mode, ES2022, bundler module resolution, declaration output) that every other variant extends.

It ships one variant per runtime shape: `nestjs.json` adds decorator metadata and an `outDir` for the NestJS apps, `nextjs.json` relaxes target/lib and enables the Next.js TS plugin, `react-library.json` sets up JSX for component packages like `@repo/ui`, and `plasmo.json` configures the browser-extension build. Packages consume these via `extends` on their own `tsconfig.json` rather than duplicating compiler options.
