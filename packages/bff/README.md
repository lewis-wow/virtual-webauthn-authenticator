# @repo/bff

Shared plumbing for the backend-for-frontend services in this repo (`apps/api-bff` and the route handlers embedded in `apps/console`). Both act as a thin edge in front of the real API: they accept an API key from a caller, exchange it for a short-lived JWT, and forward the request onward, so this package factors out the pieces that would otherwise be duplicated between them.

It provides `TokenFetch`, an `EventEmitter`-based wrapper around a caller-supplied token-fetching function that swallows and reports fetch errors instead of throwing, and `RequestLogFormatter`, which extracts a consistent, loggable shape (URL, method, headers) from a `Request`/`Response` pair for debug logging around proxied calls.
