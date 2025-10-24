import { createAuthClient } from 'better-auth/react';

export type CreateAuthReactClientArgs = {
  baseURL: string;
  basePath: string;
};

export type AuthClient = ReturnType<typeof createAuthClient>;

export const createAuthReactClient = (
  args: CreateAuthReactClientArgs,
): AuthClient =>
  createAuthClient({
    ...args,
  });
