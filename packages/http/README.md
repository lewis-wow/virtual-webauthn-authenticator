# @repo/http

A tiny, dependency-free source of truth for HTTP status codes, so services never hardcode magic numbers like `404` or `500` in application code. It exports a single `HttpStatusCode` const enum covering the full 1xx–5xx range (e.g. `HttpStatusCode.OK_200`, `HttpStatusCode.NOT_FOUND_404`, `HttpStatusCode.UPGRADE_REQUIRED_426`), with each entry named after and linked to its MDN reference.

It's intentionally narrow in scope — just status codes, not headers, methods, or other HTTP helpers — and exists mainly to be depended on by `@repo/exception`'s HTTP exception subpath and by application code (like `apps/nestjs`) that needs to set a response status without duplicating the numeric constants everywhere.
