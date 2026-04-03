/**
 * API Key generation and validation constants
 */
export const API_KEY_CONFIG = {
  /**
   * Bcrypt hashing cost (higher = more secure but slower)
   * Recommended: 10-12 for good balance between security and performance
   */
  BCRYPT_ROUNDS: 12,

  /**
   * Byte length for the 'secret' part of the API key.
   * 32 bytes = 44 base64url characters
   */
  SECRET_BYTE_LENGTH: 32,

  /**
   * Byte length for the 'lookupKey' part of the API key.
   * 16 bytes = 22 base64url characters
   */
  LOOKUP_BYTE_LENGTH: 16,

  /**
   * Number of characters from the secret to display at the start
   * Used for showing preview: 'sk_live_XXXX...YYYY'
   */
  SECRET_START_LENGTH: 8,

  /**
   * Prefix for all live API keys
   */
  KEY_PREFIX: 'sk_live_',
} as const;
