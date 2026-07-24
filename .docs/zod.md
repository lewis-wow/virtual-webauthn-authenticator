# Zod

Zod is the single validation layer for the whole monorepo — every package pins `"zod": "^4.1.12"` (Zod v4). It backs three things: ts-rest contracts in `packages/contract` (consumed by `apps/nestjs`, `apps/api-bff`, `apps/auth-server`, `apps/console`), env validation in `packages/env-config`, and form validation via React Hook Form (see [react-hook-form.md](./react-hook-form.md)). Conventions below are observed in `packages/contract/src`, `packages/validation/src`, `packages/pagination/src`, `packages/jwt/src`, `packages/api-key/src`, and `packages/env-config/src`.

## Naming convention: `*Rules` / `*FormSchema` / `*ParamsSchema` / `*QuerySchema` / `*BodySchema` / `*ResponseSchema`

`packages/contract/README.MD` documents the naming pattern used for every schema tied to an endpoint:

| Concept              | Naming Pattern    | Example                    |
| :------------------- | :----------------- | :-------------------------- |
| Rules (Internal)     | `*Rules`           | `ApiKeyRules`               |
| Form (Frontend)      | `*FormSchema`      | `CreateApiKeyFormSchema`    |
| URL Params           | `*ParamsSchema`    | `ApiKeyDetailParamsSchema`  |
| Query String         | `*QuerySchema`     | `GetApiKeysQuerySchema`     |
| Request Body         | `*BodySchema`      | `CreateApiKeyBodySchema`    |
| Response             | `*ResponseSchema`  | `ApiKeyResponseSchema`      |

In practice, the "Rules (Internal)" role is played by a plain `<Thing>Schema` base schema (e.g. `ApiKeySchema` in `packages/api-key/src/validation/ApiKeySchema.ts`, `VirtualAuthenticatorDtoSchema` in `packages/contract/src/dto/virtual-authenticators/components/`) rather than a literal `*Rules` suffix — the table is the naming *contract* for the endpoint-facing schemas, and those are what you'll actually find suffixed this way throughout `packages/contract/src/dto/**`. Per-endpoint schemas (`*ParamsSchema`, `*QuerySchema`, `*BodySchema`, `*ResponseSchema`) live one per file, one file per operation, e.g. `packages/contract/src/dto/api-keys/CreateApiKey.ts`:

```ts
// packages/contract/src/dto/api-keys/CreateApiKey.ts
export const CREATE_API_KEY_FIELDS = { name: true, permissions: true, expiresAt: true, enabled: true } as const;

export const CreateApiKeyFormSchema = ApiKeySchema.extend({
  expiresAt: DurationSchema.nullable(),
}).pick(CREATE_API_KEY_FIELDS);

export const CreateApiKeyBodySchema = ApiKeyDtoSchema.extend({
  expiresAt: DurationSchema.nullable(),
}).pick(CREATE_API_KEY_FIELDS);

export const CreateApiKeyResponseSchema = z.object({
  apiKey: ApiKeyDtoSchema,
  plaintextKey: z.string(),
});
```

The shared field set (`CREATE_API_KEY_FIELDS`) is defined once and `.pick()`ed by both the form and body schema, so the "same fields, different representation" relationship between `*FormSchema` and `*BodySchema` stays obvious and can't drift silently. When adding a new mutation, follow this same layout: one file under `packages/contract/src/dto/<domain>/<Operation>.ts` exporting whichever of `*ParamsSchema` / `*QuerySchema` / `*BodySchema` / `*ResponseSchema` the operation needs, built off a shared `<Domain>DtoSchema` in `components/`.

## `*ResponseSchema` is keyed by HTTP status code, not a single schema

Response schemas for ts-rest are plain objects mapping `HttpStatusCode` (from `@repo/http`) to the Zod schema for that status, not one flat schema:

```ts
// packages/contract/src/dto/virtual-authenticators/UpdateVirtualAuthenticator.ts
export const UpdateVirtualAuthenticatorResponseSchema = {
  [HttpStatusCode.OK_200]: VirtualAuthenticatorDtoSchema,
};
```

This is what's assigned straight to `responses` in the router (`packages/contract/src/nestjs/virtualAuthenticatorsRouter.ts`), and what handlers reference to pick the right schema for `.encode(...)` when building a response body (see `nestjs.md`'s controller example).

## `.meta()` for OpenAPI metadata, not comments

Schemas that appear in the generated OpenAPI spec carry structured metadata via Zod v4's `.meta()` rather than doc comments — `id`/`title` for named components, `description`/`examples` for field-level docs:

```ts
// packages/contract/src/dto/virtual-authenticators/components/VirtualAuthenticatorDtoSchema.ts
export const VirtualAuthenticatorDtoSchema = z
  .object({ id: z.uuid(), /* ... */ })
  .meta({ id: 'VirtualAuthenticator', title: 'VirtualAuthenticator' });
```

```ts
// packages/validation/src/codecs/DateSchemaCodec.ts
export const DateSchemaCodec = z.codec(z.iso.datetime(), z.date(), { ... }).meta({
  ref: 'IsoDatetime',
  description: 'ISO datetime',
  examples: ['2025-10-26T11:00:00Z'],
});
```

Enum schemas consistently attach an `id` and `examples` too (see `packages/activity-log/src/validation/enums/LogEntitySchema.ts`, `packages/pagination/src/validation/enums/SortKeysSchema.ts`). When adding a schema that flows into the contract/OpenAPI layer, give it `.meta()` rather than leaving it undocumented.

## Zod v4 APIs in active use — don't fall back to v3 syntax

This repo is on Zod v4 and uses v4-only APIs throughout `packages/contract` and `packages/validation`. Match these, don't reach for their v3 equivalents:

- **Top-level string formats**, not chained `.string().x()`: `z.uuid()`, `z.url()`, `z.iso.datetime()`, `z.base64url()` (see `VirtualAuthenticatorDtoSchema`, `apps/console/src/env.ts`'s `BASE_URL: z.url()`).
- **`z.enum(NativeEnumObject)`** to build an enum schema directly from a TS `enum`/const object — v4 dropped the separate `z.nativeEnum()`: `export const LogEntitySchema = z.enum(LogEntity).meta({...})` (`packages/activity-log/src/validation/enums/LogEntitySchema.ts`). This is the dominant pattern (~34 call sites); `packages/contract/src/dto/virtual-authenticators/CreateVirtualAuthenticator.ts` still has one leftover `z.nativeEnum(...)` call — treat that as legacy, not something to copy into new code.
- **`z.codec(inputSchema, outputSchema, { decode, encode })`** for values that need a different shape on the wire vs. in memory — e.g. dates and byte arrays:

  ```ts
  // packages/validation/src/codecs/DateSchemaCodec.ts
  export const DateSchemaCodec = z.codec(z.iso.datetime(), z.date(), {
    decode: (isoString) => new Date(isoString),
    encode: (date) => date.toISOString(),
  });

  // packages/validation/src/codecs/BytesSchemaCodec.ts
  export const BytesSchemaCodec = z.codec(z.base64url(), BytesSchema, {
    decode: (base64String) => z.util.base64urlToUint8Array(base64String),
    encode: (bytes) => z.util.uint8ArrayToBase64url(bytes),
  });
  ```

  `SomeSchema.encode(value)` / `SomeSchema.decode(value)` (or `.parse` for decode) is how these are actually used at call sites — see the React Hook Form submit pattern in [react-hook-form.md](./react-hook-form.md), which calls `CreateApiKeyBodySchema.encode(values)` before sending a mutation.
- **`z.int()`** for integer validation (not `z.number().int()`): `z.int().nonnegative()` (`packages/validation/src/DurationSchema.ts`, `packages/api-key/src/validation/ApiKeySchema.ts`).
- **`z.infer<typeof Schema>`** for deriving TS types from schemas is standard throughout (`packages/pagination/src/validation/PaginationResultMetaSchema.ts`, `packages/jwt/src/validation/JwtPayloadSchema.ts`, and consumer code like `apps/console/src/components/pages/VirtualAuthenticatorsPage.tsx`'s `type VirtualAuthenticator = z.infer<typeof VirtualAuthenticatorDtoSchema>`). Export the inferred type next to the schema it comes from, not in a separate types file.

## Discriminated unions for variant shapes, composed with `.and()` when needed

Use `z.discriminatedUnion(key, [...])` for anything with a tag field selecting between shapes, rather than a plain union with manual narrowing:

```ts
// packages/pagination/src/validation/PaginationResultMetaSchema.ts
export const PaginationResultMetaSchema = z.discriminatedUnion('hasNext', [
  z.object({ hasNext: z.literal(true), nextCursor: z.uuid() }),
  z.object({ hasNext: z.literal(false), nextCursor: z.null() }),
]);
```

When a schema needs both shared fields and a discriminated variant, extend the shared shape first and intersect it with the union via `.and(...)`, rather than repeating the shared fields in every branch:

```ts
// packages/jwt/src/validation/JwtPayloadSchema.ts
export const JwtPayloadSchema = JwtRegisteredClaimsSchema.extend({
  userId: UserSchema.shape.id,
  // ...
}).and(
  z.discriminatedUnion('tokenType', [
    z.object({ tokenType: z.literal(TokenType.USER), apiKeyId: z.null() }),
    z.object({
      tokenType: z.literal(TokenType.API_KEY),
      apiKeyId: z.uuid(),
      metadata: z.object({ createdWebAuthnPublicKeyCredentialCount: z.int().nonnegative() }),
    }),
  ]),
);
```

## Generic schema factories for reusable shapes

Reusable, parameterized schemas are plain functions returning a schema built from a type parameter — see `packages/pagination/src/validation/PaginationResultSchema.ts`:

```ts
export const PaginationResultSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({ data: z.array(itemSchema), meta: PaginationResultMetaSchema }).meta({ ... });
```

Consumers call it inline at the point of use rather than pre-instantiating: `ListApiKeysResponseSchema = PaginationResultSchema(ApiKeyDtoSchema)` (`packages/contract/src/dto/api-keys/ListApiKeys.ts`). Follow this pattern for any schema shape (pagination envelopes, result wrappers, etc.) that's reused across multiple DTOs with a different inner type each time.

## Cross-field validation via `.refine()` with `path`

Cross-field checks that a plain object shape can't express use `.refine()`, targeting the field that should show the error with `path`:

```ts
// packages/contract/src/dto/virtual-authenticators/CreateVirtualAuthenticator.ts
.refine(
  (data) => {
    if (data.userVerificationType === VirtualAuthenticatorUserVerificationType.PIN) {
      return data.pin !== undefined && data.pin.length >= 4;
    }
    return true;
  },
  { message: 'PIN is required when user verification type is PIN.', path: ['pin'] },
);
```

## Env validation: `defineEnv` wraps `@t3-oss/env-core`'s `createEnv`

`packages/env-config/src/defineEnv.ts` is a thin wrapper around `createEnv` from `@t3-oss/env-core` that adds `emptyStringAsUndefined: true` and a `SKIP_ENV_VALIDATION` escape hatch (parsed with `z.coerce.boolean()`). Every app's `src/env.ts` calls it the same way — server vars under `server`, optionally public vars under `client` with a `clientPrefix`:

```ts
// apps/nestjs/src/env.ts
export const env = defineEnv({
  server: {
    PORT: z.coerce.number(),
    BASE_URL: z.url(),
    ENVIRONMENT: z.enum(['production', 'development', 'test']),
    LOG_LEVEL: z.string().optional().transform((arg) => mapLogLevelTag(arg)),
    DATABASE_URL: z.url(),
  },
  runtimeEnv: process.env,
});
```

`z.coerce.number()` / `z.coerce.boolean()` for values that arrive as strings from `process.env`, `.transform(...)` for turning a raw env string into a typed value the rest of the app consumes (see `LOG_LEVEL` above), and inline `z.enum([...])` for small closed string sets are the standard shapes here — add new env vars to the `server`/`client` object with the narrowest schema that matches, not `z.string()` plus manual parsing downstream.

## Docs

- llms.txt: https://zod.dev/llms.txt
- Official docs: https://zod.dev

If you need a Zod API not covered by the conventions above (e.g. `.superRefine`, branded types, custom error maps), check the docs linked above rather than guessing or reaching for a v3-era equivalent.
