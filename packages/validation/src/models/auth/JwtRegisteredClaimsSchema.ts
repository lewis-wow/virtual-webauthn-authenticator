import { z } from 'zod';

/**
 * Zod schema for JWT Registered Claims
 * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1 RFC7519#section-4.1}
 */
export const JwtRegisteredClaimsSchema = z
  .looseObject({
    /**
     * JWT Issuer
     * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.1 RFC7519#section-4.1.1}
     */
    iss: z.string().optional().describe('JWT Issuer'),

    /**
     * JWT Subject
     * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.2 RFC7519#section-4.1.2}
     */
    sub: z.string().optional().describe('JWT Subject'),

    /**
     * JWT Audience
     * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.3 RFC7519#section-4.1.3}
     */
    aud: z
      .union([z.string(), z.array(z.string())])
      .optional()
      .describe('JWT Audience'),

    /**
     * JWT ID
     * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.7 RFC7519#section-4.1.7}
     */
    jti: z.string().optional().describe('JWT ID'),

    /**
     * JWT Not Before
     * Per RFC, this is a "NumericDate" (seconds since epoch).
     * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.5 RFC7519#section-4.1.5}
     */
    nbf: z.number().optional().describe('JWT Not Before'),

    /**
     * JWT Expiration Time
     * Per RFC, this is a "NumericDate" (seconds since epoch).
     * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.4 RFC7519#section-4.1.4}
     */
    exp: z.number().optional().describe('JWT Expiration Time'),

    /**
     * JWT Issued At
     * Per RFC, this is a "NumericDate" (seconds since epoch).
     * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.6 RFC7519#section-4.1.6}
     */
    iat: z.number().optional().describe('JWT Issued At'),
  })
  .meta({
    ref: 'JwtRegisteredClaims',
  });

export type JwtRegisteredClaims = z.infer<typeof JwtRegisteredClaimsSchema>;
