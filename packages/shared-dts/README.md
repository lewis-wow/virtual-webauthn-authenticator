# @repo/shared-dts

A tiny package with no runtime exports — just ambient `.d.ts` files that patch global or third-party types repo-wide once, instead of every app/package redeclaring them locally. It has no `src/index.ts`; its `.d.ts` files are meant to be referenced directly (e.g. via `tsconfig` `include`/`types`) by whatever project needs the augmentation.

Currently it declares two augmentations: `nodejs.d.ts` extends the global `NodeJS.ProcessEnv` interface with this repo's custom environment variables (e.g. `INCLUDE_OPENAPI_EXAMPLES`) so `process.env` stays typed without every app redefining it, and `zod.d.ts` augments Zod's `GlobalMeta` interface to add an `examples` field, which the OpenAPI-generating schemas in `@repo/contract` rely on to attach example values to a schema's metadata.
