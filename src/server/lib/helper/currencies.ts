import { EstimateMode } from "@server/external/bitcoinRpc.js";
import TransferPriority from "@server/model/currency/transferPriority.js";

export function toEstimateMode(priority?: TransferPriority): EstimateMode {
    switch (priority) {
        case "important":
            return "conservative";
        case "normal":
            return "economical";
        case "unimportant":
            return "economical";
        default:
            return "economical";
    }
}

export function toPriorityNumber(priority?: TransferPriority): number {
    switch (priority) {
        case "important":
            return 3;
        case "normal":
            return 2;
        case "unimportant":
            return 1;
        default:
            return 1;
    }
}
