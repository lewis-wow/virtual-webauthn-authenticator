import { DateSchemaCodec } from '../../codecs/DateSchemaCodec';
import { UserSchema } from '../../models/common/UserSchema';

export const UserDtoSchema = UserSchema.extend({
  createdAt: DateSchemaCodec,
  updatedAt: DateSchemaCodec,
});
