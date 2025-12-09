import { createIntegrationConfig } from '@repo/vitest-config/createIntegrationConfig';

import pkg from '../package.json';

export default createIntegrationConfig({
  name: pkg.name,
  dirname: import.meta.dirname,
});
