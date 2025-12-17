import { RefreshToken } from './RefreshToken';

export interface Users {
  id: string;
  userName?: string;
  normalizedUserName?: string;
  email?: string;
  emailConfirmed?: boolean;
  phoneNumber?: string | null;
  refreshToken?: RefreshToken[];
}
