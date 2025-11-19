import { Schema } from 'effect';

export const BytesSchema = Schema.Uint8ArrayFromBase64Url.pipe(
  Schema.annotations({
    jsonSchema: {
      contentEncoding: 'base64url',
    },
  }),
);
