import { expect } from 'vitest';

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export const unreachable = (ctor?: Function) =>
  expect.unreachable(
    ctor ? `${ctor?.name} should have been thrown.` : 'Should be unreachable.',
  );
