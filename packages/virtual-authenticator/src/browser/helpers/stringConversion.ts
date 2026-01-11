import type { Uint8Array_ } from '@repo/types';

/**
 * Encodes a string to UTF-8 bytes as a Uint8Array.
 *
 * @param str - The string to encode
 * @returns A Uint8Array containing UTF-8 encoded bytes
 */
export function stringToBytes(str: string): Uint8Array_ {
  return new TextEncoder().encode(str) as Uint8Array_;
}

/**
 * Decodes UTF-8 bytes to a string.
 *
 * @param bytes - The Uint8Array containing UTF-8 encoded bytes
 * @returns The decoded string
 */
export function bytesToString(bytes: Uint8Array_): string {
  return new TextDecoder().decode(bytes);
}

/**
 * Encodes a string to UTF-8 bytes as an ArrayBuffer.
 *
 * @param str - The string to encode
 * @returns An ArrayBuffer containing UTF-8 encoded bytes
 */
export function stringToArrayBuffer(str: string): ArrayBuffer {
  const bytes = new TextEncoder().encode(str);
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
}

/**
 * Decodes an ArrayBuffer containing UTF-8 bytes to a string.
 *
 * @param arrayBuffer - The ArrayBuffer containing UTF-8 encoded bytes
 * @returns The decoded string
 */
export function arrayBufferToString(arrayBuffer: ArrayBuffer): string {
  return new TextDecoder().decode(arrayBuffer);
}

/**
 * Serializes an object to JSON and returns it as a Uint8Array.
 * Useful for creating clientDataJSON.
 *
 * @param obj - The object to serialize
 * @returns A Uint8Array containing the UTF-8 encoded JSON string
 */
export function jsonToBytes(obj: unknown): Uint8Array_ {
  return stringToBytes(JSON.stringify(obj));
}

/**
 * Parses a Uint8Array containing JSON data to an object.
 *
 * @param bytes - The Uint8Array containing UTF-8 encoded JSON
 * @returns The parsed object
 */
export function bytesToJson<T = unknown>(bytes: Uint8Array_): T {
  return JSON.parse(bytesToString(bytes));
}

/**
 * Serializes an object to JSON and returns it as an ArrayBuffer.
 *
 * @param obj - The object to serialize
 * @returns An ArrayBuffer containing the UTF-8 encoded JSON string
 */
export function jsonToArrayBuffer(obj: unknown): ArrayBuffer {
  return stringToArrayBuffer(JSON.stringify(obj));
}

/**
 * Parses an ArrayBuffer containing JSON data to an object.
 *
 * @param arrayBuffer - The ArrayBuffer containing UTF-8 encoded JSON
 * @returns The parsed object
 */
export function arrayBufferToJson<T = unknown>(arrayBuffer: ArrayBuffer): T {
  return JSON.parse(arrayBufferToString(arrayBuffer));
}
