import z from 'zod';

import { AuthenticatorTransport } from '../../enums/AuthenticatorTransport';

export const AuthenticatorTransportSchema = z.enum(AuthenticatorTransport).meta({
  id: 'AuthenticatorTransport',
  examples: [AuthenticatorTransport.USB],
});
