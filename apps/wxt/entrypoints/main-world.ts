import { mainWorldMessaging } from '@/messaging/mainWorldMessaging';

const LOG_PREFIX = 'MAIN';

export default defineUnlistedScript(() => {
  console.log(`[${LOG_PREFIX}]`, 'Init');

  window.navigator.credentials.create = async () => {
    const response = await mainWorldMessaging.sendMessage('credentials.create');
    console.log(response);

    return null;
  };

  window.navigator.credentials.get = async () => {
    const response = await mainWorldMessaging.sendMessage('credentials.get');
    console.log(response);

    return null;
  };
});
