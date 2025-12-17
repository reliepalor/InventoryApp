export interface Brands {
  id: number;
  referenceId?: string | null;
  model: string;
  motherboard: string;
  officeInstalled: string;
  osInstalled: string;
  processor: string;
  ramModel: string;
  ramSize: string;
  storageModel: string;
  storageSize: string;
  videoCardMemory: string;
  videoCardModel: string;
  userId: string;
}

export interface BrandCreateRequest {
  referenceId?: string | null;
  model: string;
  motherboard: string;
  officeInstalled: string;
  osInstalled: string;
  processor: string;
  ramModel: string;
  ramSize: string;
  storageModel: string;
  storageSize: string;
  videoCardMemory: string;
  videoCardModel: string;
  userId: string;
}

export interface BrandUpdateRequest {
  id: number;
  referenceId?: string | null;
  model: string;
  motherboard: string;
  officeInstalled: string;
  osInstalled: string;
  processor: string;
  ramModel: string;
  ramSize: string;
  storageModel: string;
  storageSize: string;
  videoCardMemory: string;
  videoCardModel: string;
  userId: string;
}