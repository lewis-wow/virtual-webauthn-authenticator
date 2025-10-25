import type { ZodOpenApiOperationObject } from 'zod-openapi';

export type QuerySchema<T extends ZodOpenApiOperationObject> =
  T['requestParams'] extends { query: infer S } ? S : undefined;

/** Safely extracts the Path schema */
export type PathSchema<T extends ZodOpenApiOperationObject> =
  T['requestParams'] extends { path: infer S } ? S : undefined;

/** Safely extracts the Header schema */
export type HeaderSchema<T extends ZodOpenApiOperationObject> = T extends {
  requestHeaders: infer S;
}
  ? S
  : undefined;

/** Safely extracts the Cookie schema */
export type CookieSchema<T extends ZodOpenApiOperationObject> = T extends {
  requestCookies: infer S;
}
  ? S
  : undefined;

// --- Request Body (using your provided pattern) ---

/** Generic, safe extractor for any request body content-type */
type ContentSchema<
  T extends ZodOpenApiOperationObject,
  ContentType extends string,
> = T['requestBody'] extends {
  content: { [K in ContentType]: { schema: infer S } };
}
  ? S
  : undefined;

/** Safely extracts the 'application/json' schema */
export type JsonSchema<T extends ZodOpenApiOperationObject> = ContentSchema<
  T,
  'application/json'
>;

export type ResponseBodySchema<
  T extends ZodOpenApiOperationObject,
  SCode extends keyof T['responses'],
  CType extends string,
> = T['responses'][SCode] extends {
  content: { [K in CType]: { schema: infer S } };
}
  ? S
  : undefined;

export class Handler {
  /** Returns the Zod schema for query parameters */
  static query<T extends ZodOpenApiOperationObject>(
    operation: T,
  ): QuerySchema<T> {
    return operation.requestParams?.query as QuerySchema<T>;
  }

  /** Returns the Zod schema for path parameters */
  static param<T extends ZodOpenApiOperationObject>(
    operation: T,
  ): PathSchema<T> {
    return operation.requestParams?.path as PathSchema<T>;
  }

  /** Returns the Zod schema for headers */
  static header<T extends ZodOpenApiOperationObject>(
    operation: T,
  ): HeaderSchema<T> {
    return operation.requestParams?.header as HeaderSchema<T>;
  }

  /** Returns the Zod schema for cookies */
  static cookie<T extends ZodOpenApiOperationObject>(
    operation: T,
  ): CookieSchema<T> {
    return operation.requestParams?.cookie as CookieSchema<T>;
  }

  /** Returns the Zod schema for 'application/json' request body */
  static json<T extends ZodOpenApiOperationObject>(
    operation: T,
  ): JsonSchema<T> {
    return operation.requestBody?.content['application/json']
      ?.schema as JsonSchema<T>;
  }

  static response<
    T extends ZodOpenApiOperationObject,
    SCode extends keyof T['responses'],
    CType extends string,
  >(
    operation: T,
    statusCode: SCode,
    contentType: CType,
  ): ResponseBodySchema<T, SCode, CType> {
    // We must use type assertions here, as TypeScript cannot
    // prove the complex runtime path matches our conditional type.
    const response = operation.responses[statusCode as any] as any;
    const schema = response?.content?.[contentType]?.schema;

    return schema as ResponseBodySchema<T, SCode, CType>;
  }
}
