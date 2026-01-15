# Virtual WebAuthn Authenticator

[![codecov](https://codecov.io/gh/lewis-wow/virtual-webauthn-authenticator/graph/badge.svg?token=4J12KNM8S0)](https://codecov.io/gh/lewis-wow/virtual-webauthn-authenticator)

## Run project in dev mode

To start the project in development mode, run the command below. This will launch all applications in the `apps` directory, excluding the example Next.js application.

```bash
./docker-compose-test.sh
pnpm dev --filter '!@repo/nextjs-example'
```

Without extension:

```bash
pnpm dev --filter '!@repo/nextjs-example' --filter '!@repo/wxt'
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

## WebAuthn spec

<https://www.w3.org/TR/webauthn-3/>

## FIDO CTAP2 spec

<https://fidoalliance.org/specs/fido-v2.2-ps-20250714/fido-client-to-authenticator-protocol-v2.2-ps-20250714.html>

## Key Vault

[Azure Key Vault](https://learn.microsoft.com/en-us/azure/key-vault/)

[LowKey Vault for development](https://github.com/nagyesta/lowkey-vault)

## WebAuthn official demo

<https://webauthn.io/>

## Example

To run the Next.js passkeys example, navigate to the example directory, prepare the database, and start the server:

```bash
cd examples/nextjs
pnpm db:generate
pnpm db:push
pnpm start
```

The server will be available at `http://localhost:4000`.

### Icons resources

<https://simpleicons.org>

<https://lucide.dev/icons/blocks>

<https://portal.azure.com>

<https://www.plasmo.com>
