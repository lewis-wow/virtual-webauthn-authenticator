import type { ListenerFn } from '@/utils/InteractionService';
import { interaction, InteractionEventMap } from '@/utils/interaction';
import { isExceptionShape } from '@repo/exception';
import { useExtensionDialog } from '@repo/ui/context/ExtensionDialogContext';
import {
  CredentialSelectAgentException,
  UserPresenceRequiredAgentException,
  UserVerificationRequiredAgentException,
} from '@repo/virtual-authenticator/authenticatorAgent';
import { match } from 'ts-pattern';

import { CredentialOptionsDialog } from './CredentialOptionsDialog';
import { ErrorDialog } from './ErrorDialog';
import { UserPresenceDialog } from './UserPresenceDialog';
import { UserVerificationDialog } from './UserVerificationDialog';

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
        .when(isExceptionShape(CredentialSelectAgentException), (error) => {
          return (
            <CredentialOptionsDialog
              credentialOptions={error.data.credentialOptions}
              onCancel={() => {
                resolve(null);
                closeDialog();
              }}
              onConfirm={(selectedCredentialOptionId) => {
                console.log(`[${LOG_PREFIX}] User selected credential:`, {
                  selectedCredentialOptionId,
                });

                // Selection implicitly satisfies UP
                const baseState = {
                  credentialId: selectedCredentialOptionId,
                  up: true,
                  stateToken: error.data.stateToken,
                };

                if (error.data.requireUserVerification) {
                  // Chain into UV dialog before resolving
                  openDialog(
                    <UserVerificationDialog
                      onCancel={() => {
                        resolve(null);
                        closeDialog();
                      }}
                      onConfirm={() => {
                        console.log(
                          `[${LOG_PREFIX}] User confirmed verification after credential select.`,
                        );
                        resolve({ ...baseState, uv: true });
                        closeDialog();
                      }}
                    />,
                  );
                } else {
                  resolve(baseState);
                  closeDialog();
                }
              }}
            />
          );
        })
        .when(isExceptionShape(UserPresenceRequiredAgentException), (error) => {
          // If UV is also required, show UV dialog directly (UV implies UP)
          if (error.data.requireUserVerification) {
            return (
              <UserVerificationDialog
                onCancel={() => {
                  resolve(null);
                  closeDialog();
                }}
                onConfirm={() => {
                  console.log(
                    `[${LOG_PREFIX}] User confirmed verification (implies presence).`,
                  );
                  resolve({
                    up: true,
                    uv: true,
                    stateToken: error.data.stateToken,
                  });
                  closeDialog();
                }}
              />
            );
          }

          return (
            <UserPresenceDialog
              onCancel={() => {
                resolve(null);
                closeDialog();
              }}
              onConfirm={() => {
                console.log(`[${LOG_PREFIX}] User confirmed presence.`);
                resolve({
                  up: true,
                  stateToken: error.data.stateToken,
                });
                closeDialog();
              }}
            />
          );
        })
        .when(
          isExceptionShape(UserVerificationRequiredAgentException),
          (error) => {
            // UV implies UP
            return (
              <UserVerificationDialog
                onCancel={() => {
                  resolve(null);
                  closeDialog();
                }}
                onConfirm={() => {
                  console.log(
                    `[${LOG_PREFIX}] User confirmed verification (implies presence).`,
                  );
                  resolve({
                    up: true,
                    uv: true,
                    stateToken: error.data.stateToken,
                  });
                  closeDialog();
                }}
              />
            );
          },
        )
        .otherwise((error) => {
          resolve(null);

          return <ErrorDialog error={error} onClose={closeDialog} />;
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
