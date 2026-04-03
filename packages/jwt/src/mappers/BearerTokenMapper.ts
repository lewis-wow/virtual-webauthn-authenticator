import { assertSchema } from '@repo/assert';
import z from 'zod';

/**
 * A utility class for handling the formatting and extraction
 * of HTTP Authorization Bearer tokens.
 */
export class BearerTokenMapper {
  /**
   * Formats a raw token string into a standard HTTP Bearer authorization header value.
   * @param token - The raw access token (e.g., "eyJhbG...").
   * @returns The formatted string prefixed with "Bearer " (e.g., "Bearer eyJhbG...").
   */
  static toBearerToken(token: string): string {
    return `Bearer ${token}`;
  }

  /**
   * Extracts the raw token from a Bearer authorization string.
   * @param bearerToken - The full authorization string (e.g., "Bearer eyJhbG...").
   * @returns The raw token with the "Bearer " prefix removed.
   * @throws {Error} If the bearerToken does not start with "Bearer ".
   */
  static fromBearerToken(bearerToken: unknown): string {
    assertSchema(bearerToken, z.string().startsWith('Bearer '));

    const token = bearerToken.replace('Bearer ', '');

    return token;
  }

  /**
   * Attempts to extract the raw token from a Bearer authorization string.
   * @param bearerToken - The full authorization string (e.g., "Bearer eyJhbG...").
   * @returns The raw token with the "Bearer " prefix removed, or null if not a valid Bearer token.
   */
  static tryFromBearerToken(bearerToken: unknown): string | null {
    try {
      return BearerTokenMapper.fromBearerToken(bearerToken);
    } catch {
      return null;
    }
  }
}
