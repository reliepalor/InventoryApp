export interface InventoryItem {
  id: string;

  brand?: string;
  model?: string;
  motherboard?: string;

  officeInstalled?: boolean;
  osInstalled?: string;

  processor?: string;

  ramModel?: string;
  ramSize?: string;

  storageModel?: string;
  storageSize?: string;

  videoMemory?: string;
  videoModel?: string;
}
