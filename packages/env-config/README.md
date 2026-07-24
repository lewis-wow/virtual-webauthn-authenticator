# @repo/env-config

A minimal wrapper around `@t3-oss/env-core` so every app in the monorepo validates `process.env` against a Zod schema the same way, instead of trusting untyped environment variables at runtime. Its single export, `defineEnv`, is a drop-in replacement for `t3-oss`'s `createEnv` that forces `emptyStringAsUndefined: true` (so blank env vars from `.env.*` files or Docker are treated as unset rather than as the literal empty string) and adds an opt-out escape hatch: if the caller's `runtimeEnv.SKIP_ENV_VALIDATION` coerces to `true`, validation is skipped entirely.

That skip flag exists for build-time contexts (e.g. Docker image builds or CI steps) where the real secrets aren't available yet and shouldn't block the build. Consumers still define their own Zod schema and call `defineEnv({ server, client, runtimeEnv })` exactly as they would `createEnv`; this package only standardizes the two cross-cutting behaviors above.
