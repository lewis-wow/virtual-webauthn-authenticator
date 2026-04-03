import { fromBearerToken } from './fromBearerToken';

export const tryFromBearerToken = (bearerToken: unknown): string | null => {
  try {
    return fromBearerToken(bearerToken);
  } catch {
    return null;
  }
};
