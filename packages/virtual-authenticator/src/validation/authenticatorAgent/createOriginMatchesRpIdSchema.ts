import { z } from 'zod';

export const createOriginMatchesRpIdSchema = (rpId: string) => {
  return z.string().superRefine((val: string, ctx) => {
    // Exact match
    if (val === rpId) return; // Success, just return

    // Subdomain match
    // Must end with dot + rpId (e.g., ".example.com")
    // AND be longer than the rpId itself (to avoid ".example.com" matching just ".example.com")
    if (val.endsWith(`.${rpId}`) && val.length > rpId.length + 1) {
      return; // Success
    }

    ctx.addIssue({
      code: 'custom',
      message: `Origin "${val}" is not a valid subdomain of RP ID "${rpId}".`,
    });
  });
};
