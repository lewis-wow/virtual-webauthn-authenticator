import { createIntegrationConfig } from '@repo/vitest-config/integration-factory';

import pkg from '../package.json';

export default createIntegrationConfig({
  dirname: import.meta.dirname,
  name: pkg.name,
});
