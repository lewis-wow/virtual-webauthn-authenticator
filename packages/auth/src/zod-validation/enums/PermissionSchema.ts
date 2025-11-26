import z from 'zod';

import { Permission } from '../../enums/Permission';

export const PermissionSchema = z.enum(Permission).meta({
  description: 'Permission',
  examples: [Permission['ApiKey.create']],
});
