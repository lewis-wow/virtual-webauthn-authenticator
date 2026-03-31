/**
 * API-BFF Route Patterns
 */
export const API_ROUTE_PATTERN = '/api/*';

/**
 * CORS Configuration
 */
export const CORS_CONFIG = {
  /**
   * Allow all origins (can be configured via environment variable if needed)
   */
  ALLOW_ORIGINS: process.env.CORS_ALLOW_ORIGINS || '*',
} as const;
