import { Schema } from 'effect';

export const JwtSchema = Schema.String.pipe(
  Schema.pattern(/^[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]*$/, {
    message: () => 'Expected a valid JWT string',
  }),
).annotations({
  identifier: 'JWT',
  title: 'JWT',
});
