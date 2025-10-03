import { TransformFnParams, TransformationType } from 'class-transformer';

/**
 * Transforms a Uint8Array to a hex string and back.
 * It also supports deserializing from the object-like structure
 * that results from `JSON.stringify(new Uint8Array([...]))`.
 *
 * @param params The transformation parameters.
 * @returns A hex string (for class to plain), a Uint8Array (for plain to class),
 * or the original value if it's null/undefined or the type is unknown.
 */
export const transformUint8Array = (
  params: TransformFnParams,
): Uint8Array | string | any => {
  // Return null or undefined values as is
  if (params.value === null || params.value === undefined) {
    return params.value;
  }

  switch (params.type) {
    // CLASS_TO_PLAIN: Convert Uint8Array -> hex string
    case TransformationType.CLASS_TO_PLAIN:
      return Buffer.from(params.value as Uint8Array).toString('hex');

    // PLAIN_TO_CLASS: Convert hex string OR object -> Uint8Array
    case TransformationType.PLAIN_TO_CLASS:
      const { value } = params;

      // Handle hex string input
      if (typeof value === 'string') {
        return new Uint8Array(Buffer.from(value, 'hex'));
      }

      // Handle object input from JSON.stringify({ '0': 79, '1': 252, ... })
      if (
        typeof value === 'object' &&
        !Array.isArray(value) &&
        value !== null
      ) {
        // Object.values() extracts the byte numbers in the correct order
        return new Uint8Array(Object.values(value));
      }

      // Return value as is if it's not a recognized format
      return value;

    // For any other transformation type, return the value as is
    default:
      return params.value;
  }
};
