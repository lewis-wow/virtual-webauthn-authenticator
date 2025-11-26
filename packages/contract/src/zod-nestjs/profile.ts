import { initContract } from '@ts-rest/core';

import { GetProfileResponseSchema } from '../zod-validation/profile/get/GetProfileResponseSchema';

const c = initContract();

export const profileRouter = c.router({
  get: {
    method: 'GET',
    path: '/profile',
    responses: {
      200: GetProfileResponseSchema,
    },
    summary: "Get the user's profile",
  },
});
