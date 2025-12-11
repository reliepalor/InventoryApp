export interface InventoryItem {
  id: number;
  tagNumber: string;
  datePurchased: string | Date;
  department?: string;
  assignedTo?: string;
  type?: string;
  brand?: string;

  modelId?: number;
  statusId?: number;
  locationId?: number;
}


export interface CreateInventoryRequest {
  tagNumber: string;
  datePurchased: string | Date;
  department?: string;
  assignedTo?: string;
  type?: string;
  brand?: string;

  modelId?: number;
  statusId?: number;
  locationId?: number;
}


export interface UpdateInventoryRequest {
  id: number;
  tagNumber: string;
  datePurchased: string | Date;
  department?: string;
  assignedTo?: string;
  type?: string;
  brand?: string;

  modelId?: number;
  statusId?: number;
  locationId?: number;
}
