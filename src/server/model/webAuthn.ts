export interface PRFExtensionResults {
    prf?: {
        results?: {
            first?: Buffer<ArrayBuffer>;
            second?: Buffer<ArrayBuffer>;
        };
        enabled?: boolean;
    };
}
