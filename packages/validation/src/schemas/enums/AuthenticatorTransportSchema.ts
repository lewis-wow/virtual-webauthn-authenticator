import z from 'zod';
import { AuthenticatorTransport } from '@repo/enums';

/**
 * Corresponds to: `AuthenticatorTransport`
 */
export const AuthenticatorTransportSchema = z
  .enum(AuthenticatorTransport)
  .describe('The transport type of the authenticator, if known.');
