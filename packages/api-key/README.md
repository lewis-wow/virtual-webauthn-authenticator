# @repo/api-key

Long-lived credentials for non-browser callers — external relying parties, scripts, or the browser extension — that need to authenticate to the backend without a session cookie or a short-lived JWT. It exists as the machine-to-machine counterpart to better-auth's session and `@repo/jwt`'s tokens.

`ApiKeyManager` is a Prisma-backed class that generates keys as a `sk_`-prefixed lookup segment plus a random secret (only the bcrypt hash of the secret is persisted, so the plaintext key is shown once), verifies a presented key by looking it up and comparing the secret while rejecting revoked or expired keys, and updates `lastUsedAt` on each successful check. It also handles revoking, updating, deleting, fetching, and paginated listing of a user's keys, each of which carries its own set of `@repo/auth` `Permission` grants that scope what the key is allowed to do.
