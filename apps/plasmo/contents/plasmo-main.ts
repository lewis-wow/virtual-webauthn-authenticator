import { type PlasmoMessaging } from '@plasmohq/messaging';
import { nanoid } from 'nanoid';
import type { PlasmoCSConfig } from 'plasmo';

export const config: PlasmoCSConfig = {
  matches: ['<all_urls>'],
  world: 'MAIN',
  run_at: 'document_start',
};

export const isSameOrigin = (
  event: MessageEvent,
  req: any,
): req is PlasmoMessaging.Request =>
  !req.__internal &&
  event.source === globalThis.window &&
  event.data.name === req.name &&
  (req.relayId === undefined || event.data.relayId === req.relayId);

export const sendViaRelay: PlasmoMessaging.SendFx = (
  req,
  messagePort = globalThis.window,
) =>
  new Promise((resolve, _reject) => {
    const instanceId = nanoid();
    const abortController = new AbortController();
    messagePort.addEventListener(
      'message',
      (event: MessageEvent<PlasmoMessaging.RelayMessage>) => {
        console.log(event);
        if (
          isSameOrigin(event, req) &&
          event.data.relayed &&
          event.data.instanceId === instanceId
        ) {
          resolve(event.data.body);
          abortController.abort();
        }
      },
      {
        signal: abortController.signal,
      },
    );

    messagePort.postMessage(
      {
        ...req,
        instanceId,
      } as PlasmoMessaging.RelayMessage,
      {
        targetOrigin: req.targetOrigin || '/',
      },
    );
  });

const originalCredentialsGet = navigator.credentials.get;
const originalCredentialsCreate = navigator.credentials.create;

navigator.credentials.get = async (...args) => {
  console.log('Intercepted navigator.credentials.get');
  const res = await sendViaRelay({
    name: 'fetch-google',
    body: {
      method: 'get',
    },
  });
  console.log(res);
  return originalCredentialsGet.apply(navigator.credentials, args);
};

navigator.credentials.create = async (...args) => {
  console.log('Intercepted navigator.credentials.create');
  await sendViaRelay({
    name: 'fetch-google',
    body: {
      method: 'create',
    },
  });
  return originalCredentialsCreate.apply(navigator.credentials, args);
};
