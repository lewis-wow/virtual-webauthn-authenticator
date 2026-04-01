import { z } from 'zod';

export const OriginSchema = z.url().refine(
  (val) => {
    try {
      // Create a URL object
      const url = new URL(val);

      // Compare the input string with the .origin property
      // .origin automatically strips paths, query parameters, and trailing slashes
      return url.origin === val;
    } catch {
      return false; // If new URL fails (though .url() should have caught this beforehand)
    }
  },
  {
    message:
      'Value must be a valid origin (e.g., https://example.com without a trailing slash).',
  },
);
