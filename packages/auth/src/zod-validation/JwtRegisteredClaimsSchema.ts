import z from 'zod';

/**
 * Zod schema for JWT Registered Claims
 * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1 RFC7519#section-4.1}
 */
export const JwtRegisteredClaimsSchema = z.object({
  /**
   * JWT Issuer
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.1 RFC7519#section-4.1.1}
   */
  iss: z.string().optional().meta({
    description: 'JWT Issuer',
  }),

  /**
   * JWT Subject
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.2 RFC7519#section-4.1.2}
   */
  sub: z.string().optional().meta({
    description: 'JWT Subject',
  }),

  /**
   * JWT Audience
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.3 RFC7519#section-4.1.3}
   */
  aud: z.union([z.string(), z.array(z.string())]).optional().meta({
    description: 'JWT Audience',
  }),

  /**
   * JWT ID
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.7 RFC7519#section-4.1.7}
   */
  jti: z.string().optional().meta({
    description: 'JWT ID',
  }),

  /**
   * JWT Not Before
   * Per RFC, this is a "NumericDate" (seconds since epoch).
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.5 RFC7519#section-4.1.5}
   */
  nbf: z.number().optional().meta({
    description: 'JWT Not Before',
  }),

  /**
   * JWT Expiration Time
   * Per RFC, this is a "NumericDate" (seconds since epoch).
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.4 RFC7519#section-4.1.4}
   */
  exp: z.number().optional().meta({
    description: 'JWT Expiration Time',
  }),

  /**
   * JWT Issued At
   * Per RFC, this is a "NumericDate" (seconds since epoch).
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.6 RFC7519#section-4.1.6}
   */
  iat: z.number().optional().meta({
    description: 'JWT Issued At',
  }),
}).meta({
  identifier: 'JwtRegisteredClaims',
  title: 'JwtRegisteredClaims',
});

export type JwtRegisteredClaims = z.infer<
  typeof JwtRegisteredClaimsSchema
>;

