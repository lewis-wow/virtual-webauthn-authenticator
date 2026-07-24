# @repo/crypto

A small set of general-purpose cryptographic primitives shared across the authenticator flow, kept separate from `@repo/keys` (which deals specifically with WebAuthn/COSE/JWK key representations) and `@repo/key-vault` (which handles actual private key custody). `Encryption` wraps AES-256-GCM symmetric encryption/decryption behind a simple `key`/`plainText` API, deriving the cipher key via SHA-256 and packing the IV, auth tag, and ciphertext into a single colon-delimited string — used wherever sensitive values need to be encrypted at rest outside of Key Vault-held keys.

`Hash` provides SHA-256 hashing helpers, including variants that hash a stably-stringified JSON object (`sha256JSON`/`sha256JSONHex`) so structurally-equal objects always hash identically regardless of key order — useful for deriving deterministic identifiers or comparing ceremony option payloads.
