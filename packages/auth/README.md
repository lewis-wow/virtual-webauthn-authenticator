# @repo/auth

The shared authorization model used across apps — distinct from authentication itself, which is handled by better-auth and `@repo/jwt`/`@repo/api-key`. It exists so every service (nestjs, auth-server) checks "is this caller allowed to do this" against the same vocabulary instead of each app inventing its own.

It owns the `PermissionEntity`/`Permission` enums (fine-grained, resource-scoped actions such as `VIRTUAL_AUTHENTICATOR.CREATE` or `API_KEY.REVOKE`) that both API keys and JWTs carry as grants and that route handlers check on every mutation, plus `AuthType` (SESSION vs API_KEY) and `TokenType` (USER vs API_KEY) enums that describe how a caller authenticated and what a token's subject represents. It also provides a Zod `UserSchema` and small `toBearerToken`/`fromBearerToken`/`tryFromBearerToken` helpers for encoding and parsing the `Authorization` header.
