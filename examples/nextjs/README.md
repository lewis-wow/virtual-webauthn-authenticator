# @repo/nextjs-example

It exists to prove, end to end, that a third-party website can adopt passkeys against this project's virtual authenticator the same way it would against a real one — a relying party built entirely with off-the-shelf tooling (Next.js, [better-auth](https://www.better-auth.com/) and its `@better-auth/passkey` plugin, Prisma) rather than any code from this monorepo's authenticator itself. `@repo/ui` is the only workspace package it depends on, purely for shared visual components.

It demonstrates the full passkey lifecycle a relying party needs to support: registering an account, registering a passkey against it, logging back in with that passkey via WebAuthn, and managing/removing enrolled passkeys from a profile page. See the root [README.md](../../README.md#example-relying-party-application) for how to set up its database and run it.
