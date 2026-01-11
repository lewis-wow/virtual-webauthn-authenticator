# Virtual WebAuthn Authenticator

[![codecov](https://codecov.io/gh/lewis-wow/virtual-webauthn-authenticator/graph/badge.svg?token=4J12KNM8S0)](https://codecov.io/gh/lewis-wow/virtual-webauthn-authenticator)

## Authenticator flow

```txt
+---------------------------------------------------------------+
|                  RELYING PARTY (Web Server)                   |
+---------------------------------------------------------------+
              |
              | 0. INITIATION (Challenge / Options)
              v
+---------------------------------------------------------------+
|                   BROWSER (Web Extension)                     |
+---------------------------------------------------------------+
|                                                               |
|   1. INTERCEPTION (Main World)                                |
|   [ navigator.credentials proxy ] <--- Web App Call           |
|             |                                                 |
|             v window.postMessage                              |
|                                                               |
|   2. USER INTERFACE (Content Script)                          |
|   [ Confirmation DOM and UI ]                                 |
|             |                                                 |
|             v chrome.runtime.sendMessage                      |
|                                                               |
|   3. NETWORK LAYER (Background Service Worker)                |
|   [ Fetch API Wrapper ]                                       |
|             |                                                 |
+-------------|-------------------------------------------------+
              |
              v HTTPS / WebSocket
              |
+-------------|-------------------------------------------------+
|              VIRTUAL AUTHENTICATOR HOST (Server)              |
+---------------------------------------------------------------+
|             |                                                 |
|   4. GATEWAY                                                  |
|   [ API Endpoint ]                                            |
|             |                                                 |
|             v                                                 |
|                                                               |
|   5. LOGIC CORE                                               |
|   [ Virtual Authenticator Agent ]                             |
|   (Validation / CBOR / Parameters / Extensions)               |
|             |                                                 |
|             v                                                 |
|                                                               |
|   6. STORAGE & CRYPTO                                         |
|   [ Virtual Authenticator ]                                   |
|   (Key Vault / Signing / Counters / Attestation / Extensions) |
|                                                               |
+---------------------------------------------------------------+
```

## WebAuthn spec

<https://www.w3.org/TR/webauthn-3/>

## FIDO CTAP2 spec

<https://fidoalliance.org/specs/fido-v2.2-ps-20250714/fido-client-to-authenticator-protocol-v2.2-ps-20250714.html>

## Architecture

![Architecture image](.architecture/export/architecture.svg)

## Key Vault

[Azure Key Vault - TypeScript](https://learn.microsoft.com/en-us/azure/key-vault/secrets/quick-create-node?tabs=azure-cli%2Cwindows&pivots=programming-language-typescript)

[LowKey Vault for development](https://github.com/nagyesta/lowkey-vault)

## WebAuthn official demo

<https://webauthn.io/>

### Icons

<https://simpleicons.org>

<https://lucide.dev/icons/blocks>

<https://portal.azure.com>

<https://www.plasmo.com>
