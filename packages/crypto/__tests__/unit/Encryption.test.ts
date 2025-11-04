import * as crypto from 'node:crypto';
import { describe, expect, test } from 'vitest';

import { Encryption } from '../../src/Encryption';

// No need to import Hash, as Encryption.ts imports it internally.

describe('Encryption', () => {
  const testKey = 'my-secret-key-12345';
  const plainText = 'This is a secret message.';

  test('should encrypt and decrypt text successfully (round-trip)', () => {
    const encryptedText = Encryption.encrypt({ key: testKey, plainText });

    // Ensure the output is in the correct format "iv:authTag:encryptedData"
    const parts = encryptedText.split(':');
    expect(parts).toHaveLength(3);
    expect(Buffer.from(parts[0], 'hex').length).toBe(Encryption.IV_LENGTH);

    const decryptedText = Encryption.decrypt({ key: testKey, encryptedText });

    expect(decryptedText).toBe(plainText);
  });

  test('should fail decryption with the wrong key', () => {
    const encryptedText = Encryption.encrypt({ key: testKey, plainText });
    const wrongKey = 'wrong-key-67890';

    // AES-GCM throws a specific error for auth tag mismatch
    expect(() => {
      Encryption.decrypt({ key: wrongKey, encryptedText });
    }).toThrow('Unsupported state or unable to authenticate data');
  });

  test('should fail decryption if authTag is tampered', () => {
    const encryptedText = Encryption.encrypt({ key: testKey, plainText });
    const parts = encryptedText.split(':');

    // Generate a new random (and thus incorrect) authTag
    const tamperedAuthTag = crypto.randomBytes(16).toString('hex');
    const tamperedEncryptedText = `${parts[0]}:${tamperedAuthTag}:${parts[2]}`;

    expect(() => {
      Encryption.decrypt({
        key: testKey,
        encryptedText: tamperedEncryptedText,
      });
    }).toThrow('Unsupported state or unable to authenticate data');
  });

  test('should fail decryption if encryptedData is tampered', () => {
    const encryptedText = Encryption.encrypt({ key: testKey, plainText });
    const parts = encryptedText.split(':');

    // Generate random (and thus incorrect) data of the same length
    const tamperedData = crypto
      .randomBytes(Buffer.from(parts[2], 'hex').length)
      .toString('hex');
    const tamperedEncryptedText = `${parts[0]}:${parts[1]}:${tamperedData}`;

    expect(() => {
      Encryption.decrypt({
        key: testKey,
        encryptedText: tamperedEncryptedText,
      });
    }).toThrow('Unsupported state or unable to authenticate data');
  });

  test('should fail decryption if IV is tampered', () => {
    const encryptedText = Encryption.encrypt({ key: testKey, plainText });
    const parts = encryptedText.split(':');

    // Generate a new random (and thus incorrect) IV
    const tamperedIV = crypto.randomBytes(Encryption.IV_LENGTH).toString('hex');
    const tamperedEncryptedText = `${tamperedIV}:${parts[1]}:${parts[2]}`;

    // Decrypting with a tampered IV but correct key/authTag/data
    // should correctly fail the auth tag check in node:crypto's GCM.
    expect(() => {
      Encryption.decrypt({
        key: testKey,
        encryptedText: tamperedEncryptedText,
      });
    }).toThrow('Unsupported state or unable to authenticate data');
  });

  test('should throw assertion error for invalid encryptedText format (too few parts)', () => {
    const invalidText = 'iv:authTagOnly';

    // This fails the `isTuple([isString(), isString(), isString()])` assertion
    expect(() => {
      Encryption.decrypt({ key: testKey, encryptedText: invalidText });
    }).toThrow('Type mismatch');
  });

  test('should throw assertion error for invalid encryptedText format (empty string)', () => {
    const invalidText = '';

    // This also fails the tuple assertion
    expect(() => {
      Encryption.decrypt({ key: testKey, encryptedText: invalidText });
    }).toThrow('Type mismatch');
  });

  test('should throw error for invalid hex in IV', () => {
    const encryptedText = Encryption.encrypt({ key: testKey, plainText });
    const parts = encryptedText.split(':');
    const invalidHexText = `not-hex:${parts[1]}:${parts[2]}`;

    // This fails at `Buffer.from(parts[0], 'hex')`
    expect(() => {
      Encryption.decrypt({ key: testKey, encryptedText: invalidHexText });
    }).toThrow(); // Throws "Invalid hex string" or similar, depending on Node version
  });
});
