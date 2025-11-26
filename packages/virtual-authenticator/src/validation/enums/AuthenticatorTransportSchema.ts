import { Schema } from 'effect';

import { AuthenticatorTransport } from '../../enums/AuthenticatorTransport';

export const AuthenticatorTransportSchema = Schema.Enums(
  AuthenticatorTransport,
).pipe(
  Schema.annotations({
    identifier: 'AuthenticatorTransport',
    title: 'AuthenticatorTransport',
    examples: [AuthenticatorTransport.USB],
  }),
);
