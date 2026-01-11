import type { ListenerFn } from '@/utils/InteractionService';
import { interaction, InteractionEventMap } from '@/utils/interaction';
import { isExceptionShape } from '@repo/exception';
import { useExtensionDialog } from '@repo/ui/context/ExtensionDialogContext';
import { CredentialSelectException } from '@repo/virtual-authenticator/exceptions';
import { match } from 'ts-pattern';

import { CredentialOptionsDialog } from './CredentialOptionsDialog';
import { ErrorDialog } from './ErrorDialog';

const LOG_PREFIX = 'ERROR_MESSAGE_HANDLER';

export const App = () => {
  const { openDialog, closeDialog } = useExtensionDialog();

  useEffect(() => {
    const handleErrorMessage: ListenerFn<InteractionEventMap, 'error'> = (
      args,
      resolve,
    ) => {
      const { error } = args.response;

      const component = match(error)
        .when(isExceptionShape(CredentialSelectException), (error) => {
          return (
            <CredentialOptionsDialog
              credentialOptions={error.data.credentialOptions}
              onOpenChange={(isOpen) => {
                if (!isOpen) closeDialog();
              }}
              onConfirm={async (selectedCredentialOptionId) => {
                console.log(`[${LOG_PREFIX}] User selected:`, {
                  selectedCredentialOptionId,
                });

                resolve({
                  hash: error.data.hash,
                  selectedCredentialOptionId,
                });

                closeDialog();
              }}
            />
          );
        })
        .otherwise((error) => {
          resolve(null);

          return (
            <ErrorDialog
              error={error}
              onOpenChange={(isOpen) => {
                if (!isOpen) closeDialog();
              }}
            />
          );
        });

      openDialog(component);
    };

    // Add listener
    interaction.onInteraction('error', handleErrorMessage);

    // Cleanup
    return () => {
      interaction.offInteraction('error', handleErrorMessage);
    };
  }, [openDialog]);

  return null;
};
