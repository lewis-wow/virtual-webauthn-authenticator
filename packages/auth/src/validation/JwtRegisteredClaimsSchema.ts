import { Schema } from 'effect';

/**
 * Zod schema for JWT Registered Claims
 * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1 RFC7519#section-4.1}
 */
export const JwtRegisteredClaimsSchema = Schema.Struct({
  /**
   * JWT Issuer
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.1 RFC7519#section-4.1.1}
   */
  iss: Schema.optional(Schema.String).annotations({
    description: 'JWT Issuer',
  }),

  /**
   * JWT Subject
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.2 RFC7519#section-4.1.2}
   */
  sub: Schema.optional(Schema.String).annotations({
    description: 'JWT Subject',
  }),

  /**
   * JWT Audience
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.3 RFC7519#section-4.1.3}
   */
  aud: Schema.optional(
    Schema.Union(Schema.String, Schema.Array(Schema.String)),
  ).annotations({
    description: 'JWT Audience',
  }),

  /**
   * JWT ID
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.7 RFC7519#section-4.1.7}
   */
  jti: Schema.optional(Schema.String).annotations({
    description: 'JWT ID',
  }),

  /**
   * JWT Not Before
   * Per RFC, this is a "NumericDate" (seconds since epoch).
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.5 RFC7519#section-4.1.5}
   */
  nbf: Schema.optional(Schema.Number).annotations({
    description: 'JWT Not Before',
  }),

  /**
   * JWT Expiration Time
   * Per RFC, this is a "NumericDate" (seconds since epoch).
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.4 RFC7519#section-4.1.4}
   */
  exp: Schema.optional(Schema.Number).annotations({
    description: 'JWT Expiration Time',
  }),

  /**
   * JWT Issued At
   * Per RFC, this is a "NumericDate" (seconds since epoch).
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.6 RFC7519#section-4.1.6}
   */
  iat: Schema.optional(Schema.Number).annotations({
    description: 'JWT Issued At',
  }),
}).annotations({
  identifier: 'JwtRegisteredClaims',
});

export type JwtRegisteredClaims = Schema.Schema.Type<
  typeof JwtRegisteredClaimsSchema
>;
