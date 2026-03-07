import { assertSchema } from '@repo/assert';
import z from 'zod';

import { VirtualAuthenticatorUserVerificationType } from './enums/VirtualAuthenticatorUserVerificationType';
import { CredentialSelectException } from './exceptions/CredentialSelectException';
import { InvalidUserVerificationPin } from './exceptions/InvalidUserVerificationPin';
import { UnknownUserVerificationType } from './exceptions/UnknownUserVerificationType';
import { UserPresenceNotAvailable } from './exceptions/UserPresenceNotAvailable';
import { UserPresenceRequired } from './exceptions/UserPresenceRequired';
import { UserVerificationNotAvailable } from './exceptions/UserVerificationNotAvailable';
import { UserVerificationRequired } from './exceptions/UserVerificationRequired';
import { VirtualAuthenticatorNotActive } from './exceptions/VirtualAuthenticatorNotActive';
import type { IVirtualAuthenticatorRepository } from './repositories/virtualAuthenticatorRepository/IVirtualAuthenticatorRepository';
import type { AuthenticationState } from './state/AuthenticationStateSchema';
import type { RegistrationState } from './state/RegistrationStateSchema';
import type { AuthenticatorMetaArgs } from './validation/AuthenticatorMetaArgsSchema';
import { VirtualAuthenticatorUserVerificationTypeSchema } from './validation/enums/VirtualAuthenticatorUserVerificationTypeSchema';
import type { ApplicablePublicKeyCredential } from './validation/spec/ApplicablePublicKeyCredentialSchema';

export type AuthorizationGestureOptions = {
  virtualAuthenticatorRepository: IVirtualAuthenticatorRepository;
};

export class AuthorizationGesture {
  private readonly virtualAuthenticatorRepository: IVirtualAuthenticatorRepository;

  constructor(opts: AuthorizationGestureOptions) {
    this.virtualAuthenticatorRepository = opts.virtualAuthenticatorRepository;
  }

  private async _validateUserVerification(opts: {
    pin: string | null;
    userVerificationType: VirtualAuthenticatorUserVerificationType;
    userVerification: {
      pin?: string;
    };
  }): Promise<boolean> {
    const { pin, userVerificationType, userVerification } = opts;

    assertSchema(
      userVerificationType,
      VirtualAuthenticatorUserVerificationTypeSchema,
    );

    switch (userVerificationType) {
      case VirtualAuthenticatorUserVerificationType.NONE: {
        return true;
      }
      case VirtualAuthenticatorUserVerificationType.PIN: {
        assertSchema(pin, z.string().min(1));

        if (userVerification.pin !== pin) {
          throw new InvalidUserVerificationPin();
        }

        return true;
      }
      default: {
        throw new UnknownUserVerificationType();
      }
    }
  }

  async checkAuthorizationGestureOrThrow(opts: {
    applicablePublicKeyCredentials?: ApplicablePublicKeyCredential[];
    requireUserVerification: boolean;
    requireUserPresence: boolean;
    meta: AuthenticatorMetaArgs;
    state?: RegistrationState | AuthenticationState;
  }) {
    const {
      applicablePublicKeyCredentials,
      requireUserPresence,
      requireUserVerification,
      meta,
      state,
    } = opts;

    const virtualAuthenticator =
      await this.virtualAuthenticatorRepository.findUnique({
        virtualAuthenticatorId: meta.virtualAuthenticatorId,
      });

    if (!virtualAuthenticator.isActive) {
      throw new VirtualAuthenticatorNotActive();
    }

    if (
      applicablePublicKeyCredentials !== undefined &&
      applicablePublicKeyCredentials.length > 1
    ) {
      throw new CredentialSelectException({
        credentialOptions: applicablePublicKeyCredentials,
        requireUserPresence,
        requireUserVerification,
        userVerificationType: meta.userVerificationType,
      });
    }

    if (requireUserPresence === true && meta.userPresenceEnabled === false) {
      throw new UserPresenceNotAvailable();
    }

    if (requireUserPresence === true && !state?.up) {
      throw new UserPresenceRequired({
        requireUserVerification,
        requireUserPresence,
        userVerificationType: meta.userVerificationType,
      });
    }

    if (
      requireUserVerification === true &&
      meta.userVerificationEnabled === false
    ) {
      throw new UserVerificationNotAvailable();
    }

    if (requireUserVerification === true) {
      if (state?.uv === undefined) {
        throw new UserVerificationRequired({
          requireUserPresence,
          requireUserVerification,
          userVerificationType: meta.userVerificationType,
        });
      }

      await this._validateUserVerification({
        userVerificationType: virtualAuthenticator.userVerificationType,
        pin: virtualAuthenticator.pin,
        userVerification: state.uv,
      });
    }
  }
}
