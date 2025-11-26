import { UserSchema } from '@repo/auth/zod-validation';

import { DateSchemaCodec } from '../codecs/DateSchemaCodec';

export const UserDtoSchema = UserSchema.extend({
  createdAt: DateSchemaCodec,
  updatedAt: DateSchemaCodec,
});
