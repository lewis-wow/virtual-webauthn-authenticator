import { Schema } from 'effect';

// Matches http/s, followed by host/port, forbids /, ?, and #
export const OriginSchema = Schema.String.pipe(
  Schema.pattern(/^https?:\/\/[^/?#\s]+$/),
  Schema.annotations({
    identifier: 'Origin',
    description: 'A valid protocol, host, and optional port without paths.',
  }),
);
