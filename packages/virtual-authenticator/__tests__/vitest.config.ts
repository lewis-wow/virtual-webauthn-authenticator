import { configDefaults, defineConfig } from 'vitest/config';
import pkg from '../package.json';

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, 'dist/**/*'],
    name: pkg.name,
  },
});
