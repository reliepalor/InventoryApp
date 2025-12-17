export interface RefreshToken {
  id: number;
  token: string;
  expires: string; // ISO date string
  created: string; // ISO date string
  revoked?: string | null; // ISO date string or null
  createdByIp?: string | null;
  revokedByIp?: string | null;
  replacedByToken?: string | null;
  isExpired?: boolean;
  isActive?: boolean;
  userId: string;
}
