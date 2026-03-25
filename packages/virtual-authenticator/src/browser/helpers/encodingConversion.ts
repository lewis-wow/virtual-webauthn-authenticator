import { fromBase64Url, toBase64Url } from '@repo/utils';

/**
 * Encodes an ArrayBuffer to a base64url string.
 *
 * @param arrayBuffer - The ArrayBuffer to encode
 * @returns A base64url encoded string
 */
export const arrayBufferToBase64url = (arrayBuffer: ArrayBuffer): string => {
  return toBase64Url(new Uint8Array(arrayBuffer));
};

/**
 * Decodes a base64url string to an ArrayBuffer.
 *
 * @param base64url - The base64url string to decode
 * @returns An ArrayBuffer containing the decoded bytes
 */
export const base64urlToArrayBuffer = (base64url: string): ArrayBuffer => {
  const bytes = fromBase64Url(base64url);
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
};
