// import { root } from '@/routes';
// import { describe, test, expect } from 'vitest';

// import { USER_EMAIL, USER_ID, USER_NAME } from '../../helpers/consts';

// const MOCK_ENV = {
//   user: {
//     id: USER_ID,
//     email: USER_EMAIL,
//     name: USER_NAME,
//   },
// };

// describe('Healthcheck GET handler', () => {
//   test('test', async () => {
//     const response = await root.request('/api/healthcheck', {}, MOCK_ENV);

//     const json = await response.json();

//     expect(json).toMatchInlineSnapshot(`
//       {
//         "healthy": true,
//         "user": null,
//       }
//     `);
//   });
// });
