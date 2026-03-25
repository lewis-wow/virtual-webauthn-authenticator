import {
  fromBase64,
  fromBase64Url,
  fromHex,
  toBase64,
  toBase64Url,
  toHex,
} from '@repo/utils';

export const bytesToBase64url = (bytes: Uint8Array): string => {
  return toBase64Url(bytes);
};

export const base64urlToBytes = (base64url: string): Uint8Array => {
  return fromBase64Url(base64url);
};

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

export const bytesToBase64 = (bytes: Uint8Array): string => {
  return toBase64(bytes);
};

export const base64ToBytes = (base64: string): Uint8Array => {
  return fromBase64(base64);
};

export const bytesToHex = (bytes: Uint8Array): string => {
  return toHex(bytes);
};

export const hexToBytes = (hex: string): Uint8Array => {
  return fromHex(hex);
};
