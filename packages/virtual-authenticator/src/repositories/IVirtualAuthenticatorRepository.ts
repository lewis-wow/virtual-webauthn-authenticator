export type ValidatePinArgs = {
  virtualAuthenticatorId: string;
  userId: string;
  pin: string;
};

export interface IVirtualAuthenticatorRepository {
  validatePin(opts: ValidatePinArgs): Promise<boolean>;
}
