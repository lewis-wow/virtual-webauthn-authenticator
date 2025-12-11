export type GetEnv = {
  (key: string): string | undefined;
  (): Record<string, string | undefined>;
};

export const getEnv = ((key?: string) => {
  let env: Record<string, string | undefined> = {};

  if (typeof process !== 'undefined') {
    env = { ...env, ...process.env };
  }

  if (typeof import.meta !== 'undefined') {
    env = {
      ...env,
      ...(
        import.meta as ImportMeta & { env?: Record<string, string | undefined> }
      ).env,
    };
  }

  if (typeof key !== 'undefined') {
    return env?.[key];
  }

  return env;
}) as GetEnv;
