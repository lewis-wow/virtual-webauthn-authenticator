import '@/assets/tailwindcss.css';
import { App } from '@/components/App';
import { contentScriptToBackgroundScriptMessaging } from '@/messaging/contentScriptToBackgroundScriptMessaging';
import { mainWorldToContentScriptMessaging } from '@/messaging/mainWorldToContentScriptMessaging';
import { interaction } from '@/utils/interaction';
import { Logger } from '@repo/logger';
import { ExtensionDialogProvider } from '@repo/ui/context/ExtensionDialogContext';
import { ShadowRootProvider } from '@repo/ui/context/ShadowRootContext';
import type { RegistrationState } from '@repo/virtual-authenticator/state';
import type { AuthenticationState } from '@repo/virtual-authenticator/state';
import ReactDOM from 'react-dom/client';

const logger = new Logger({ prefix: 'CONTENT' });
logger.info('Init');

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

    logger.info('Injecting script...');

    await injectScript('/main-world.js', {
      keepInDom: true,
    });

    logger.info('Injected.');

    mainWorldToContentScriptMessaging.onMessage(
      'credentials.create',
      async (request) => {
        logger.info('credentials.create request.');

        let prevStateToken: string | undefined;
        let nextState: RegistrationState = {};

        while (true) {
          const response =
            await contentScriptToBackgroundScriptMessaging.sendMessage(
              'credentials.create',
              {
                ...request.data,
                meta: { origin: window.location.origin },
                prevStateToken,
                nextState,
              },
            );

          logger.info('credentials.create response.', response);

          if (response.ok) {
            return response;
          }

          const interactionResult = await interaction.emitInteraction('error', {
            response,
          });

          if (interactionResult === null || interactionResult === undefined) {
            return response;
          }

          const { stateToken, ...userState } = interactionResult;

          prevStateToken = stateToken;
          nextState = { ...nextState, ...userState };
        }
      },
    );

    mainWorldToContentScriptMessaging.onMessage(
      'credentials.get',
      async (request) => {
        logger.info('credentials.get request.');

        let prevStateToken: string | undefined;
        let nextState: AuthenticationState = {};

        while (true) {
          const response =
            await contentScriptToBackgroundScriptMessaging.sendMessage(
              'credentials.get',
              {
                ...request.data,
                meta: { origin: window.location.origin },
                prevStateToken,
                nextState,
              },
            );

          logger.info('credentials.get response.', response);

          if (response.ok) {
            return response;
          }

          const interactionResult = await interaction.emitInteraction('error', {
            response,
          });

          if (interactionResult === null || interactionResult === undefined) {
            return response;
          }

          const { stateToken, ...userState } = interactionResult;

          prevStateToken = stateToken;
          nextState = { ...nextState, ...userState };
        }
      },
    );
  },
});
