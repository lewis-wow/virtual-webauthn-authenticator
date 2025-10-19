import z from 'zod';

import { IsoDatetimeToDateSchema } from '../transformers/IsoDatetimeToDateSchema';

export const ApiKeySchema = z
  .object({
    id: z.cuid().meta({
      description: 'Unique identifier for the API key.',
      examples: ['clx3k2n6b0000v9o7f3h3b3k9'],
    }),
    name: z
      .string()
      .nullable()
      .optional()
      .meta({
        description:
          'A user-friendly name for the API key for easier identification.',
        examples: ["My App's Key", 'Staging Environment Key'],
      }),
    start: z
      .string()
      .nullable()
      .optional()
      .meta({
        description:
          'The first few characters of the API key, used for display purposes.',
        examples: ['sk_live_...'],
      }),
    prefix: z
      .string()
      .nullable()
      .optional()
      .meta({
        description: 'A prefix for the API key, e.g., "sk_live".',
        examples: ['sk_live', 'pk_test'],
      }),
    key: z.string().meta({
      description: 'The securely hashed API key value stored in the database.',
      examples: ['$2b$10$K/....'],
    }),
    userId: z.string().meta({
      description: 'The identifier of the user to whom this API key belongs.',
      examples: ['user_2c6a8y3a0...'],
    }),

    // Token Bucket / Refill settings
    refillInterval: z
      .number()
      .int()
      .nullable()
      .optional()
      .meta({
        description:
          'The interval in milliseconds at which the `refillAmount` is added to the `remaining` tokens.',
        examples: [60000], // e.g., 1 minute
      }),
    refillAmount: z
      .number()
      .int()
      .nullable()
      .optional()
      .meta({
        description:
          'The amount of tokens to add to the `remaining` tokens every `refillInterval`.',
        examples: [100],
      }),
    lastRefillAt: IsoDatetimeToDateSchema.nullable()
      .optional()
      .meta({
        description: 'The timestamp of the last time the tokens were refilled.',
        examples: ['2025-10-26T10:00:00Z'],
      }),
    remaining: z
      .number()
      .int()
      .nullable()
      .optional()
      .meta({
        description:
          'The number of remaining tokens available for consumption.',
        examples: [500],
      }),

    // Rate Limiting settings
    rateLimitEnabled: z
      .boolean()
      .default(false)
      .meta({
        description: 'Flag to enable or disable rate limiting for this key.',
        examples: [true, false],
      }),
    rateLimitTimeWindow: z
      .number()
      .int()
      .nullable()
      .optional()
      .meta({
        description: 'The time window in milliseconds for rate limiting.',
        examples: [60000], // e.g., 1 minute
      }),
    rateLimitMax: z
      .number()
      .int()
      .nullable()
      .optional()
      .meta({
        description:
          'The maximum number of requests allowed within the `rateLimitTimeWindow`.',
        examples: [1000],
      }),
    requestCount: z
      .number()
      .int()
      .default(0)
      .meta({
        description:
          'The current count of requests within the current rate limit window.',
        examples: [42],
      }),

    // General settings & metadata
    enabled: z
      .boolean()
      .default(true)
      .meta({
        description:
          'Indicates whether the API key is currently active and can be used.',
        examples: [true],
      }),
    expiresAt: IsoDatetimeToDateSchema.nullable()
      .optional()
      .meta({
        description:
          'The date and time when the API key will expire and can no longer be used.',
        examples: ['2026-01-01T00:00:00Z'],
      }),
    lastRequest: IsoDatetimeToDateSchema.nullable()
      .optional()
      .meta({
        description:
          'The timestamp of the last request made using this API key.',
        examples: ['2025-10-26T10:30:00Z'],
      }),
    permissions: z
      .string()
      .nullable()
      .optional()
      .meta({
        description:
          'A string or set of strings representing the permissions associated with the API key.',
        examples: ['read', 'read:posts,write:posts'],
      }),
    metadata: z
      .json()
      .nullable()
      .optional()
      .meta({
        description:
          'An object for storing any custom metadata related to the API key.',
        examples: [{ project_id: 'proj_123' }],
      }),

    createdAt: IsoDatetimeToDateSchema.meta({
      description: 'The date and time when the API key was created.',
      examples: ['2025-10-26T09:00:00Z'],
    }),
    updatedAt: IsoDatetimeToDateSchema.meta({
      description: 'The date and time when the API key was last updated.',
    }),
  })
  .meta({ id: 'ApiKey' });
