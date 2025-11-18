import { UserSchema } from '../../../../auth/src/validation/UserSchema';
import { DateSchemaCodec } from '../common/DateSchemaCodec';

export const UserDtoSchema = UserSchema.extend({
  createdAt: DateSchemaCodec,
  updatedAt: DateSchemaCodec,
});
