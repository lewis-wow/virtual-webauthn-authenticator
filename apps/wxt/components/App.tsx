import { contentScriptErrorEventEmitter } from '@/messaging/contentScriptErrorEventEmitter';
import { isExceptionShape } from '@repo/exception';
import { AnyExceptionShape } from '@repo/exception/validation';
import { useExtensionDialog } from '@repo/ui/context/ExtensionDialogContext';
import { CredentialSelectException } from '@repo/virtual-authenticator/exceptions';
import { match } from 'ts-pattern';

import { CredentialOptionsDialog } from './CredentialOptionsDialog';
import { ErrorDialog } from './ErrorDialog';

export const App = () => {
  const { openDialog, closeDialog } = useExtensionDialog();

  useEffect(() => {
    const handleErrorMessage = (error: AnyExceptionShape) => {
      const component = match(error)
        .when(isExceptionShape(CredentialSelectException), (error) => {
          return (
            <CredentialOptionsDialog
              credentialOptions={error.data.credentialOptions}
              onOpenChange={(isOpen) => {
                if (!isOpen) closeDialog();
              }}
              onConfirm={(selectedId) => {
                console.log('User selected:', selectedId);
                // TODO: Send response back to background/main world
                closeDialog();
              }}
            />
          );
        })
        .otherwise((error) => {
          return (
            <ErrorDialog
              error={error}
              onOpenChange={(isOpen) => {
                console.log('Change');
                if (!isOpen) closeDialog();
              }}
            />
          );
        });

      openDialog(component);
    };

    // Add listener
    contentScriptErrorEventEmitter.on('error', handleErrorMessage);

    // Cleanup
    return () => {
      contentScriptErrorEventEmitter.off('error', handleErrorMessage);
    };
  }, [openDialog]);

  return null;
};
