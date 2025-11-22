import { initContract } from '@ts-rest/core';
import { Schema } from 'effect';

import { GetProfileResponseSchema } from '../validation/profile/get/GetProfileResponseSchema';

const c = initContract();

export const profileRouter = c.router({
  get: {
    method: 'GET',
    path: '/profile',
    responses: {
      200: Schema.standardSchemaV1(GetProfileResponseSchema),
    },
  },
});
