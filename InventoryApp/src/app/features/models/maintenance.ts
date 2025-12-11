export interface ModelCreateRequest {
    referenceId: string;
    modelName: string;
}
export interface ModelUpdateRequest {
    id: number;
    referenceId: string;
    modelName: string;
}

export interface MotherboardCreateRequest {
    referenceId: string;
    mbName: string;
    mbSocket: string;
    mbChipset: string;
    mbDescription: string;
}
export interface MotherboardUpdateRequest {
    id: number;
    referenceId: string;
    mbName: string;
    mbSocket: string;
    mbChipset: string;
    mbDescription: string;
}