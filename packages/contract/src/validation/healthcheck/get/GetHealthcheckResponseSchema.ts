import { Schema } from 'effect';

export const GetHealthcheckResponseSchema = Schema.Struct({
  healthy: Schema.Literal(true),
}).annotations({
  identifier: 'GetHealthcheckResponse',
  title: 'GetHealthcheckResponse',
  description: 'Response for a healthcheck, indicating the service is running.',
});
