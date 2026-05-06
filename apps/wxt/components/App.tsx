import type { ListenerFn } from '@/utils/InteractionService';
import { interaction, InteractionEventMap } from '@/utils/interaction';
import { isExceptionShape } from '@repo/exception';
import { Logger } from '@repo/logger';
import { useExtensionDialog } from '@repo/ui/context/ExtensionDialogContext';
import {
  CredentialSelectAgentException,
  UserPresenceRequiredAgentException,
  UserVerificationRequiredAgentException,
} from '@repo/virtual-authenticator-agent/exceptions';
import { CredentialOptionsEmpty } from '@repo/virtual-authenticator/exceptions';
import { match } from 'ts-pattern';

import { CredentialOptionsDialog } from './CredentialOptionsDialog';
import { ErrorDialog } from './ErrorDialog';
import { UserPresenceDialog } from './UserPresenceDialog';
import { UserVerificationDialog } from './UserVerificationDialog';

const logger = new Logger({ prefix: 'ERROR_MESSAGE_HANDLER' });

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
                logger.info('User selected credential:', {
                  selectedCredentialOptionId,
                });

                // Selection implicitly satisfies UP
                const baseState = {
                  credentialId: selectedCredentialOptionId,
                  up: true,
                  stateToken: error.data.stateToken,
                };

                if (error.data.requireUserVerification) {
                  const selectedCredentialOption =
                    error.data.credentialOptions.find(
                      (credentialOption) =>
                        credentialOption.id === selectedCredentialOptionId,
                    ) ?? null;

                  console.log({ selectedCredentialOption });

                  // Chain into UV dialog before resolving
                  openDialog(
                    <UserVerificationDialog
                      userVerificationType={error.data.userVerificationType}
                      userDisplayName={
                        selectedCredentialOption?.rpUserDisplayName
                      }
                      onCancel={() => {
                        resolve(null);
                        closeDialog();
                      }}
                      onConfirm={({ pin }) => {
                        logger.info(
                          'User confirmed verification after credential select.',
                        );
                        resolve({
                          ...baseState,
                          uv: { pin },
                        });
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
                userVerificationType={error.data.userVerificationType}
                userDisplayName={error.data.userDisplayName}
                onCancel={() => {
                  resolve(null);
                  closeDialog();
                }}
                onConfirm={({ pin }) => {
                  logger.info(
                    'User confirmed verification (implies presence).',
                  );
                  resolve({
                    up: true,
                    uv: { pin },
                    stateToken: error.data.stateToken,
                  });
                  closeDialog();
                }}
              />
            );
          }

          return (
            <UserPresenceDialog
              userDisplayName={error.data.userDisplayName}
              onCancel={() => {
                resolve(null);
                closeDialog();
              }}
              onConfirm={() => {
                logger.info('User confirmed presence.');
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
                userVerificationType={error.data.userVerificationType}
                userDisplayName={error.data.userDisplayName}
                onCancel={() => {
                  resolve(null);
                  closeDialog();
                }}
                onConfirm={({ pin }) => {
                  logger.info(
                    'User confirmed verification (implies presence).',
                  );
                  resolve({
                    up: true,
                    uv: { pin },
                    stateToken: error.data.stateToken,
                  });
                  closeDialog();
                }}
              />
            );
          },
        )
        .when(isExceptionShape(CredentialOptionsEmpty), () => {
          resolve(null);

          return null;
        })
        .otherwise((error) => {
          logger.exceptionOrError(error, 'Error occured.');
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
