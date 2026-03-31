/**
 * Token caching and TTL constants
 */
export const TOKEN_CONFIG = {
  /**
   * Default TTL for tokens without expiration claim (1 hour in milliseconds)
   */
  DEFAULT_TOKEN_TTL_MS: 3600000,

  /**
   * Conversion factor from seconds to milliseconds
   */
  SECONDS_TO_MILLISECONDS: 1000,
} as const;
