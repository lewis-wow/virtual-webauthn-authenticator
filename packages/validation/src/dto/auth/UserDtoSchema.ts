import { UserSchema } from '../../models/common/UserSchema';
import { DateSchemaCodec } from '../common/DateSchemaCodec';

export const UserDtoSchema = UserSchema.extend({
  createdAt: DateSchemaCodec,
  updatedAt: DateSchemaCodec,
});
