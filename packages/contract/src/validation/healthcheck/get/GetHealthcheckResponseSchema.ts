import { Schema } from 'effect';

export const GetHealthcheckResponseSchema = Schema.Struct({
  healthy: Schema.Literal(true),
}).annotations({
  identifier: 'GetHealthcheckResponse',
});
