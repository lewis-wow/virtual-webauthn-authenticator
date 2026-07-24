# @repo/cbor

A thin, typed wrapper around the `cbor2` library providing the CBOR (Concise Binary Object Representation) encode/decode primitives the rest of the monorepo builds on. WebAuthn attestation objects, authenticator data extensions, and COSE public keys are all CBOR-encoded per spec, so every package that touches raw ceremony bytes — `@repo/virtual-authenticator`, `@repo/keys`, `@repo/key-vault` — depends on this package rather than importing `cbor2` directly.

It exists to give the codebase one consistent, `Uint8Array_`-typed surface (`encode`, `decode`, `decodeFirst`, `decodeSequence`) instead of scattering `cbor2` calls and casts throughout, keeping the third-party CBOR dependency isolated to a single place.
