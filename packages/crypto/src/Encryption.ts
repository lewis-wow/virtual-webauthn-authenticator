import { assertSchema } from '@repo/assert';
import * as crypto from 'node:crypto';
import z from 'zod';

import { Hash } from './Hash';

export class Encryption {
  static readonly ENCRYPTION_ALGORITHM = 'aes-256-gcm';
  static readonly IV_LENGTH = 16; // For AES, this is always 16

  /**
   * Encrypts a plaintext string using AES-256-GCM.
   * @param text The plaintext to encrypt.
   * @returns {string} The encrypted string, formatted as "iv:authTag:encryptedData"
   */
  static encrypt(opts: { key: crypto.BinaryLike; plainText: string }): string {
    const { key, plainText } = opts;

    const iv = crypto.randomBytes(Encryption.IV_LENGTH);

    // Create the AES-256-GCM cipher.
    const cipher = crypto.createCipheriv(
      Encryption.ENCRYPTION_ALGORITHM,
      Hash.sha256(key),
      iv,
    );

    const encryptedBuffer = Buffer.concat([
      cipher.update(plainText, 'utf8'),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encryptedBuffer.toString('hex')}`;
  }

  /**
   * Decrypts an AES-256-GCM string.
   * @param opts.key - The encryption key
   * @param opts.encryptedText - The encrypted string ("iv:authTag:encryptedData")
   * @returns The original plaintext
   * @throws Error if the encrypted text format is invalid
   */
  static decrypt(opts: {
    key: crypto.BinaryLike;
    encryptedText: string;
  }): string {
    const { key, encryptedText } = opts;
    const parts = encryptedText.split(':');

    assertSchema(parts, z.tuple([z.string(), z.string(), z.string()]));

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encryptedData = Buffer.from(parts[2], 'hex');

    const decipher = crypto.createDecipheriv(
      Encryption.ENCRYPTION_ALGORITHM,
      Hash.sha256(key),
      iv,
    );

    decipher.setAuthTag(authTag);

    const decryptedBuffer = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final(),
    ]);

    return decryptedBuffer.toString('utf8');
  }
}
