import { UserSchema } from '@repo/auth/validation';

import { DateSchemaCodec } from '../common/DateSchemaCodec';

export const UserDtoSchema = UserSchema.extend({
  createdAt: DateSchemaCodec,
  updatedAt: DateSchemaCodec,
});
