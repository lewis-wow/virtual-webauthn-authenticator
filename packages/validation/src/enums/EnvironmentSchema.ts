import z from 'zod';
import { Environment } from '@repo/enums';

/**
 * Corresponds to: `Environment`
 */
export const EnvironmentSchema = z
  .enum(Environment)
  .describe('The environment the application is running in.');
