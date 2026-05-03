import { z } from 'zod';

export const OriginSchema = z.url().refine(
  (val) => {
    try {
      const url = new URL(val);

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
