export interface Inventy {
  id: number;
  tagNumber?: string | null;
  datePurchased?: string | null; // ISO date string
  department?: string | null;
  assignedTo?: string | null;
  type?: string | null;
  brandId?: number | null;
  created_at?: string | null; // ISO date string
  updated_at?: string | null; // ISO date string
  userId?: string | null;
}
