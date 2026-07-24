# @repo/nestjs

The main authenticator API. It exposes the WebAuthn relying-party-facing operations — creating and managing virtual authenticators, handling public key credential (attestation/assertion) requests, serving JWKS, and recording activity logs — that the browser extension and console talk to.

It owns the Prisma-backed persistence for virtual authenticators and credentials, enforces permission checks on every mutation, and is where Azure Key Vault–held signing keys are actually exercised to answer WebAuthn ceremonies. Route contracts are defined once in `@repo/contract` and implemented here with `@ts-rest/nest`, so request/response shapes can't drift between this service and its callers.
