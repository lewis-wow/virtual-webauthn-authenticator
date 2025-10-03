import { User } from '@repo/prisma';
import { Path } from 'deep-pick-omit';
import { PickDeep } from 'type-fest';

export const USER_PUBLIC_FIELDS = [
  'id',
  'name',
  'email',
] as const satisfies Path<User>[];

export type UserPublicFields = PickDeep<
  User,
  (typeof USER_PUBLIC_FIELDS)[number]
>;
