/**
 * Converts a 16-byte Buffer to a UUID string.
 * @param {Buffer} buffer The 16-byte buffer.
 * @returns {string} The formatted UUID string.
 */
export const bufferToUuid = (buffer: Buffer): string => {
  const hex = buffer.toString('hex');

  // Insert hyphens at the correct positions (8-4-4-4-12)
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};
