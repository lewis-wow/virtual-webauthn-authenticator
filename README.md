# Virtual WebAuthn Authenticator

[![codecov](https://codecov.io/gh/lewis-wow/virtual-webauthn-authenticator/graph/badge.svg?token=4J12KNM8S0)](https://codecov.io/gh/lewis-wow/virtual-webauthn-authenticator)

Traditional password authentication is inherently vulnerable to phishing and data breaches. Although the industry is moving toward more secure hardware and platform passkeys, these solutions introduce usability challenges. Users must manage physical devices and risk account lockouts if they lose them. Server-side authenticators offer a more user-friendly alternative. They eliminate the strict dependence on specific hardware but require strong protection of cryptographic material in a cloud environment. This thesis proposes and demonstrates an implementation of such a virtual authenticator in Node.js. The solution includes a web extension to intercept standard WebAuthn API calls and route them to the authenticator web service.

## About This Project

This is a thesis project exploring server-side WebAuthn authenticators as an alternative to traditional hardware security keys. It's designed for research and demonstration purposes, not production use.

**License**: See [LICENSE](LICENSE) file.

## Development prerequisites

- **Node.js** 18+
- **pnpm** package manager for monorepo
- **Docker & Docker Compose** for PostgreSQL and Key Vault

## Project Structure

- **`apps/`** — Main applications
- **`packages/`** — Shared libraries (auth, crypto, database, UI components, etc.)
- **`examples/`** — Example Next.js app with passkeys integration

## Getting Started

### Run in Development Mode

```bash
./docker-compose-test.sh  # Start PostgreSQL and Key Vault
pnpm dev --filter '!@repo/nextjs-example'
```

Without browser extension:

```bash
./docker-compose-test.sh  # Start PostgreSQL and Key Vault
pnpm dev --filter '!@repo/nextjs-example' --filter '!@repo/wxt'
```

### Run Tests

```bash
pnpm test                   # All tests
pnpm test:unit              # Unit tests
pnpm test:integration       # Integration tests
pnpm coverage               # Coverage report
```

## Authenticator flow

```plaintext
+---------------------------------------------------------------+
|                  RELYING PARTY (Web Server)                   |
+-------------+-------------------------------------------------+
              |
              | 0. INITIATION (Challenge / Options)
              v
+-------------+-------------------------------------------------+
|                   BROWSER (Web Extension)                     |
+-------------+-------------------------------------------------+
|             |                                                 |
|   1. INTERCEPTION (Main World)                                |
|   [ navigator.credentials proxy ] <--- Web App Call           |
|             |                                                 |
|             v window.postMessage                              |
|             |                                                 |
|   2. USER INTERFACE (Content Script)                          |
|   [ Confirmation DOM and UI ]                                 |
|             |                                                 |
|             v chrome.runtime.sendMessage                      |
|             |                                                 |
|   3. NETWORK LAYER (Background Service Worker)                |
|   [ Fetch API Wrapper ]                                       |
|             |                                                 |
+-------------+-------------------------------------------------+
              |
              v HTTPS
              |
+-------------+-------------------------------------------------+
|              VIRTUAL AUTHENTICATOR HOST (Server)              |
+-------------+-------------------------------------------------+
|             |                                                 |
|   4. GATEWAY                                                  |
|   [ API Endpoint ]                                            |
|             |                                                 |
|             v                                                 |
|             |                                                 |
|   5. LOGIC CORE                                               |
|   [ Virtual Authenticator Agent ]                             |
|   (Validation / CBOR / Parameters / Extensions)               |
|             |                                                 |
|             v                                                 |
|             |                                                 |
|   6. STORAGE & CRYPTO                                         |
|   [ Virtual Authenticator ]                                   |
|   (Key Vault / Signing / Counters / Attestation / Extensions) |
|                                                               |
+---------------------------------------------------------------+
```

## Architecture

```plaintext
+------------------------------------------------------------+
|                                                            |
|                   PostgreSQL (Database)                    |
|                                                            |
+-----------+--------------------------------------+---------+
            |                                      |
            |                                      |
            |                                      |
 +----------+---------+                 +----------+---------+       +--------------------+
 |                    |                 |                    |       |                    |
 |    Auth service    |                 |        API         +-------+  Azure Key Vault   |
 |                    |                 |                    |       |                    |
 +----------+-----+---+                 +---+------+---------+       +--------------------+
            |     |                         |      |
            |     |                         |      |
            |     |                         |      |
            |     |                         |      |
     Session|     --------------------------+-|    | JWT
            |     +-------------------------| |    |
            |     |                           |    |
            |     | JWT                API key|    |
            |     |                           |    |
 +----------+-----+---+                 +-----+----+---------+       +--------------------+
 |                    |                 |                    |       |                    |
 |    Console BFF     |                 |   Public API BFF   +-------+    OpenAPI Docs    |
 |                    |                 |                    |       |                    |
 +----------+---------+                 +----------+---------+       +--------------------+
            |                                      |
            |                                      |
     Session|                                      |API key
            |                                      |
            |                                      |
 +----------+---------+                 +----------+---------+
 |                    |                 |                    |
 |  Console Frontend  |                 | Browser Extension  |
 |                    |                 |                    |
 +--------------------+                 +--------------------+
```

## Example Relying Party Application

Try the Next.js passkeys example:

```bash
cd examples/nextjs && pnpm db:generate && pnpm db:push && pnpm start
```

Available at `http://localhost:4000`.

## Configuration

**Environment Variables**: Managed with [dotenvx](https://dotenvx.com/) for dev/test/production with encryption support for secrets.

- Dev/Test: `.env.development`, `.env.test` (plaintext)
- Production: `.env.production` (encrypted), decryption key in `.env.keys`
- ⚠️ **Never commit `.env.keys`** to version control

**Key Vault**: Uses [Azure Key Vault](https://learn.microsoft.com/en-us/azure/key-vault/) (production) or [LowKey Vault](https://github.com/nagyesta/lowkey-vault) (development)

### Find Dead Code

```bash
pnpm dead-code          # Unused files + exports
pnpm dead-code:report   # Same report, always exits 0
pnpm dead-code:files    # Unused files only
pnpm dead-code:exports  # Unused exports only
```

## Resources

**Specifications:**

- [WebAuthn Level 3](https://www.w3.org/TR/webauthn-3/)
- [FIDO CTAP2](https://fidoalliance.org/specs/fido-v2.2-ps-20250714/fido-client-to-authenticator-protocol-v2.2-ps-20250714.html)

**Key Vault:**

- [Azure Key Vault](https://learn.microsoft.com/en-us/azure/key-vault/) (production)
- [LowKey Vault](https://github.com/nagyesta/lowkey-vault) (development)

**Tools & References:**

- [WebAuthn.io Demo](https://webauthn.io/)
- [Icons: Simple Icons](https://simpleicons.org) | [Lucide](https://lucide.dev/icons/blocks) | [Azure Portal](https://portal.azure.com) | [Plasmo](https://www.plasmo.com)
