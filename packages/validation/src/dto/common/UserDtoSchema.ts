import { UserSchema } from '../../models/common/UserSchema';
import { DateSchemaCodec } from './DateSchemaCodec';

export const UserDtoSchema = UserSchema.extend({
  createdAt: DateSchemaCodec,
  updatedAt: DateSchemaCodec,
});
