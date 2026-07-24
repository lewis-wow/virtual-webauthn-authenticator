# @repo/activity-log

An audit trail for every mutation performed against a user's resources — API keys, credentials, virtual authenticators — so users and operators can see who did what and when. Apps call into this package's `audit()` after each write via an `auditLog()`-style helper, so the record of "what happened" isn't scattered across ad-hoc logging in each route handler.

`ActivityLog` is a Prisma-backed class whose `audit()` writes a `Log` row (action, entity, entity id, acting user/API key, arbitrary metadata) without ever throwing back into the caller on failure — write errors are instead emitted as an `error` event — and whose `getUserHistory()` returns a paginated, sortable history for a user. It owns the `LogAction` (CREATE/GET/LIST/UPDATE/DELETE) and `LogEntity` (API_KEY/CREDENTIAL/VIRTUAL_AUTHENTICATOR/WEB_AUTHN_PUBLIC_KEY_CREDENTIAL) enums plus the Zod schemas that define the shape of a log record.
