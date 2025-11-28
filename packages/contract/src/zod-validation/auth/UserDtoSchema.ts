import { UserSchema } from '@repo/auth/zod-validation';

import { DateSchemaCodec } from '../../dto/codecs/DateSchemaCodec';

export const UserDtoSchema = UserSchema.extend({
  createdAt: DateSchemaCodec,
  updatedAt: DateSchemaCodec,
});
