import type { Uint8Array_ } from '@repo/types';
import { Buffer } from 'buffer';

/**
 * Encodes a Uint8Array to a base64url string.
 * Base64url is the URL-safe variant of base64 used in WebAuthn.
 *
 * @param bytes - The Uint8Array to encode
 * @returns A base64url encoded string
 */
export function bytesToBase64url(bytes: Uint8Array_): string {
  return Buffer.from(bytes).toString('base64url');
}

/**
 * Decodes a base64url string to a Uint8Array.
 *
 * @param base64url - The base64url string to decode
 * @returns A Uint8Array containing the decoded bytes
 */
export function base64urlToBytes(base64url: string): Uint8Array_ {
  return new Uint8Array(Buffer.from(base64url, 'base64url'));
}

/**
 * Encodes an ArrayBuffer to a base64url string.
 *
 * @param arrayBuffer - The ArrayBuffer to encode
 * @returns A base64url encoded string
 */
export function arrayBufferToBase64url(arrayBuffer: ArrayBuffer): string {
  return Buffer.from(new Uint8Array(arrayBuffer)).toString('base64url');
}

/**
 * Decodes a base64url string to an ArrayBuffer.
 *
 * @param base64url - The base64url string to decode
 * @returns An ArrayBuffer containing the decoded bytes
 */
export function base64urlToArrayBuffer(base64url: string): ArrayBuffer {
  const bytes = Buffer.from(base64url, 'base64url');
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
}

/**
 * Encodes a Uint8Array to a standard base64 string.
 *
 * @param bytes - The Uint8Array to encode
 * @returns A base64 encoded string
 */
export function bytesToBase64(bytes: Uint8Array_): string {
  return Buffer.from(bytes).toString('base64');
}

/**
 * Decodes a standard base64 string to a Uint8Array.
 *
 * @param base64 - The base64 string to decode
 * @returns A Uint8Array containing the decoded bytes
 */
export function base64ToBytes(base64: string): Uint8Array_ {
  return new Uint8Array(Buffer.from(base64, 'base64'));
}

/**
 * Encodes a Uint8Array to a hexadecimal string.
 *
 * @param bytes - The Uint8Array to encode
 * @returns A hexadecimal encoded string
 */
export function bytesToHex(bytes: Uint8Array_): string {
  return Buffer.from(bytes).toString('hex');
}

/**
 * Decodes a hexadecimal string to a Uint8Array.
 *
 * @param hex - The hexadecimal string to decode
 * @returns A Uint8Array containing the decoded bytes
 */
export function hexToBytes(hex: string): Uint8Array_ {
  return new Uint8Array(Buffer.from(hex, 'hex'));
}
