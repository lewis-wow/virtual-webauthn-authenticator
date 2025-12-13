import z from 'zod';

export const RpIdSchema = z
  .string()
  .min(1, 'RP ID is required')
  // 1. Block Protocols
  .refine((val) => !val.includes('://'), {
    message: 'RP ID must be a domain, not a URL (remove https://)',
  })
  // 2. Block Ports
  .refine((val) => !val.includes(':'), {
    message: 'RP ID must not contain a port number',
  })
  // 3. Block IP Addresses (WebAuthn spec forbids IPs)
  .refine((val) => !/^\d{1,3}(\.\d{1,3}){3}$/.test(val), {
    message: 'RP ID cannot be an IP address',
  })
  // 4. Validate Domain Syntax (Allows 'localhost' or valid domains)
  .regex(
    /^(localhost|(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,})$/,
    { message: 'Must be a valid domain name (e.g., example.com)' },
  );
