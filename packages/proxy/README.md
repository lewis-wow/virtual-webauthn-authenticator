# @repo/proxy

A small HTTP forwarding helper used by the BFF layer (`apps/api-bff` and `apps/console`'s API route handlers) to relay an incoming `Request` to a backend service and stream its response straight back to the client, without buffering the body.

`proxy(targetBaseUrl, request, options)` rewrites the request's path and query onto the target base URL, strips the `host` header, applies caller-supplied header overrides (set, leave unchanged, or delete a header depending on whether the value is a string, `undefined`, or `null` — used by callers to inject a freshly minted `Authorization` bearer token), and forwards the original method, streamed body, and abort signal via `fetch`. It exists so every BFF-style app forwards requests the same way instead of reimplementing header rewriting and streaming semantics per app.
