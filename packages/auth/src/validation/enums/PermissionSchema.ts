import { Schema } from 'effect';

import { Permission } from '../../enums/Permission';

export const PermissionSchema = Schema.Enums(Permission).annotations({
  description: 'Permission',
  examples: [Permission['credential.create']],
});
