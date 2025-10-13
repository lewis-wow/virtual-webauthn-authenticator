import { defineConfig } from 'vitest/config';

import pkg from '../package.json';

export default defineConfig({
  test: {
    name: pkg.name,
  },
});
