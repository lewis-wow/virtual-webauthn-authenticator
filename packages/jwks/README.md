# @repo/jwks

The concrete persistence backend for the auth-server's own JWT signing keys. `@repo/jwt` defines the `IJwksRepository` interface and the `Jwks` class that uses it to generate, rotate, and expose keys, but stays storage-agnostic; this package is the Prisma-backed implementation the auth-server actually registers, so signing keys survive restarts, can be rotated while older tokens still verify, and can be served from the auth-server's `/.well-known/jwks.json` endpoint that other services (e.g. nestjs's `JwtAudience`) fetch to verify tokens.

`PrismaAuthJwksRepository` implements `create`/`findLatest`/`findAll` against the shared `Jwks` Prisma model, scoping every query to a fixed `label: 'auth'` so this key set can coexist in the same table as unrelated key sets used elsewhere in the system (such as the virtual authenticator's own JWKS repository) without colliding.
