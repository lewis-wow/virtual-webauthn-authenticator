import '@/assets/tailwindcss.css';
import { App } from '@/components/App';
import { contentScriptErrorEventEmitter } from '@/messaging/contentScriptErrorEventEmitter';
import { extensionMessaging } from '@/messaging/extensionMessaging';
import { mainWorldMessaging } from '@/messaging/mainWorldMessaging';
import { ExtensionDialogProvider } from '@repo/ui/context/ExtensionDialogContext';
import { ShadowRootProvider } from '@repo/ui/context/ShadowRootContext';
import ReactDOM from 'react-dom/client';

const LOG_PREFIX = 'CONTENT';
console.log(`[${LOG_PREFIX}]`, 'Init');

export default defineContentScript({
  matches: ['<all_urls>'],
  cssInjectionMode: 'ui',
  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: 'wxt-shadow-root',
      position: 'inline',
      anchor: 'body',
      append: 'first',
      onMount: (container) => {
        // Create a root for React
        const root = ReactDOM.createRoot(container);

        // Pass the container as a prop so we can target it for Portals
        root.render(
          <ShadowRootProvider container={container}>
            <ExtensionDialogProvider>
              <App />
            </ExtensionDialogProvider>
          </ShadowRootProvider>,
        );
        return root;
      },
      onRemove: (root) => {
        root?.unmount();
      },
    });

    ui.mount();

    console.log(`[${LOG_PREFIX}]`, 'Injecting script...');

    await injectScript('/main-world.js', {
      keepInDom: true,
    });

    console.log(`[${LOG_PREFIX}]`, 'Injected.');

    mainWorldMessaging.onMessage('credentials.create', async (request) => {
      console.log(`[${LOG_PREFIX}]`, 'credentials.create request.');

      const response = await extensionMessaging.sendMessage(
        'credentials.create',
        request.data,
      );

      console.log(`[${LOG_PREFIX}]`, 'credentials.create response.', response);

      if (!response.ok) {
        contentScriptErrorEventEmitter.emit('error', {
          response,
          request,
        });
      }

      return response;
    });

    mainWorldMessaging.onMessage('credentials.get', async (request) => {
      console.log(`[${LOG_PREFIX}]`, 'credentials.get request.');

      const response = await extensionMessaging.sendMessage(
        'credentials.get',
        request.data,
      );

      console.log(`[${LOG_PREFIX}]`, 'credentials.get response.', response);

      if (!response.ok) {
        contentScriptErrorEventEmitter.emit('error', {
          response,
          request,
        });
      }

      return response;
    });
  },
});
