import { Schema } from 'effect';

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export const EmailSchema = Schema.String.pipe(
  Schema.pattern(EMAIL_REGEX, {
    message: () => 'Invalid email address',
  }),
).annotations({
  identifier: 'Email',
  title: 'Email',
  description: 'A valid email address',
  jsonSchema: { format: 'email' },
});

export type Email = Schema.Schema.Type<typeof EmailSchema>;
