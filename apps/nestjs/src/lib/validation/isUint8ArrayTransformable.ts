import { buildMessage, ValidateBy, ValidationOptions } from 'class-validator';

export const IS_UINT8ARRAY_TRANSFORMABLE = 'isUint8ArrayTransformable';

/**
 * Checks if the value is a format that can be transformed into a Uint8Array.
 * This includes:
 * - A hex-encoded string.
 * - An object from JSON.stringify(Uint8Array) like { '0': 79, '1': 252, ... }.
 */
function isUint8ArrayTransformable(value: unknown): boolean {
  // Pass if it's already a Uint8Array (for class-to-class transformations)
  if (value instanceof Uint8Array) {
    return true;
  }

  // Check for a valid hex string
  if (typeof value === 'string') {
    // Must contain only hex characters and have an even length for valid byte pairs
    return /^[0-9a-fA-F]*$/.test(value) && value.length % 2 === 0;
  }

  // Check for the object format { '0': 1, '1': 2, ... }
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    // A robust check to ensure all values are valid bytes (numbers 0-255)
    return Object.values(value).every(
      (byte) => typeof byte === 'number' && byte >= 0 && byte <= 255,
    );
  }

  return false;
}

/**
 * Decorator that checks if a property's value can be transformed into a Uint8Array
 * by our custom transformer.
 * @param validationOptions Standard class-validator options.
 */
export function IsUint8ArrayTransformable(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: IS_UINT8ARRAY_TRANSFORMABLE,
      validator: {
        validate: (value): boolean => isUint8ArrayTransformable(value),
        defaultMessage: buildMessage(
          (eachPrefix) =>
            `${eachPrefix}$property must be a valid hex string or a byte object that can be transformed into a Uint8Array`,
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}
