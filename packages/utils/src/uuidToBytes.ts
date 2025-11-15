/**
 * Converts a UUID string to a Buffer.
 * @param {string} uuid The UUID string (e.g., '123e4567-e89b-12d3-a456-426614174000').
 * @returns {Buffer} A 16-byte buffer representation of the UUID.
 */
export const uuidToBytes = (uuid: string): Uint8Array => {
  // Remove hyphens and create a buffer from the resulting hex string
  return Buffer.from(uuid.replace(/-/g, ''), 'hex');
};
