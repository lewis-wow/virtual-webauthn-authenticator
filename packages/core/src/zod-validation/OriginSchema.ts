import { z } from 'zod';

// Matches http/s, followed by host/port, forbids /, ?, and #
export const OriginSchema = z.pattern(/^https?:\/\/[^/?#\s]+$/).meta({
  id: 'Origin',
  title: 'Origin',
  description: 'A valid protocol, host, and optional port without paths.',
});
