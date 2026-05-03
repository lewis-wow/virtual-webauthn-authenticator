# Virtual WebAuthn Authenticator

[![codecov](https://codecov.io/gh/lewis-wow/virtual-webauthn-authenticator/graph/badge.svg?token=4J12KNM8S0)](https://codecov.io/gh/lewis-wow/virtual-webauthn-authenticator)

Traditional password authentication is inherently vulnerable to phishing and data breaches. Although the industry is moving toward more secure hardware and platform passkeys, these solutions introduce usability challenges. Users must manage physical devices and risk account lockouts if they lose them. Server-side authenticators offer a more user-friendly alternative. They eliminate the strict dependence on specific hardware but require strong protection of cryptographic material in a cloud environment. This thesis proposes and demonstrates an implementation of such a virtual authenticator in Node.js. The solution includes a web extension to intercept standard WebAuthn API calls and route them to the authenticator web service.

<!-- TOC_START -->

## Table of Contents

- [Virtual WebAuthn Authenticator](#virtual-webauthn-authenticator)
  - [Table of Contents](#table-of-contents)
  - [About This Project](#about-this-project)
  - [Development prerequisites](#development-prerequisites)
  - [Project Structure](#project-structure)
  - [Getting Started](#getting-started)
    - [1. Install Dependencies](#1-install-dependencies)
    - [2. Start Infrastructure](#2-start-infrastructure)
    - [3. Run in Development Mode](#3-run-in-development-mode)
    - [Run Tests](#run-tests)
    - [Code Quality](#code-quality)
  - [Authenticator flow](#authenticator-flow)
  - [Architecture](#architecture)
  - [Example Relying Party Application](#example-relying-party-application)
    - [1. Set Up the Database Schema](#1-set-up-the-database-schema)
    - [2. Run in Development Mode](#2-run-in-development-mode)
  - [Configuration](#configuration)
  - [Resources](#resources)

<!-- TOC_END -->

## About This Project

This is a thesis project exploring server-side WebAuthn authenticators as an alternative to traditional hardware security keys. It's designed for research and demonstration purposes, not production use.

**License**: See [LICENSE](LICENSE) file.

## Development prerequisites

- **Node.js** 18+
- **pnpm** package manager for monorepo
- **Docker & Docker Compose** for PostgreSQL and Key Vault

## Project Structure

- **[`apps/`](./apps/)** — Main applications
- **[`packages/`](./packages/)** — Shared libraries (auth, crypto, database, UI components, etc.)
- **[`examples/`](./examples/)** — Example Next.js app with passkeys integration

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Start Infrastructure

Start PostgreSQL and the [LowKey Vault](https://github.com/nagyesta/lowkey-vault) development Key Vault mock:

```bash
./docker-compose-test.sh
```

> **Note:** `./docker-compose-test.sh` starts a [LowKey Vault](https://github.com/nagyesta/lowkey-vault) container — a local Azure Key Vault mock intended for development only.

### 3. Run in Development Mode

> **Note:** Starts all services in development mode, excluding the example relying party application.

```bash
pnpm dev --filter '!@repo/nextjs-example'
```

> **Note:** Starts all services in development mode, excluding both the example relying party application and the browser extension.

```bash
pnpm dev --filter '!@repo/nextjs-example' --filter '!@repo/wxt'
```

### Run Tests

```bash
pnpm test                   # All tests
pnpm test:unit              # Unit tests
pnpm test:integration       # Integration tests
pnpm coverage               # Coverage report
```

### Code Quality

You can use the following commands to ensure code quality:

```bash
pnpm format       # Format code with Prettier
pnpm lint         # Run ESLint
pnpm check-types  # Run TypeScript type-checking
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

The [`examples/nextjs`](./examples/nextjs/) directory contains a full Next.js application that demonstrates passkeys integration using [better-auth](https://www.better-auth.com/) as the relying party.

### 1. Set Up the Database Schema

From the monorepo root, generate the Prisma client and push the schema:

```bash
pnpm --filter @repo/nextjs-example db:generate && pnpm --filter @repo/nextjs-example db:push
```

### 2. Run in Development Mode

```bash
pnpm dev --filter @repo/nextjs-example
```

Available at `http://localhost:4000`.

## Configuration

**Environment Variables**: Managed with [dotenvx](https://dotenvx.com/) for dev/test/production with encryption support for secrets.

By default, the environment is set to `development`. This can be changed by setting the `ENVIRONMENT` variable (e.g., `export ENVIRONMENT=production`). The default setting is defined in [`.vscode/settings.json`](./.vscode/settings.json).

- Dev/Test: [`.env.development`](./.env.development), [`.env.test`](./.env.test) (plaintext)
- Production: [`.env.production`](./.env.production) (encrypted), decryption key in [`.env.keys`](./.env.keys)
- ⚠️ **Never commit [`.env.keys`](./.env.keys)** to version control

**Key Vault**: Uses [Azure Key Vault](https://learn.microsoft.com/en-us/azure/key-vault/) (production) or [LowKey Vault](https://github.com/nagyesta/lowkey-vault) (development)

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
