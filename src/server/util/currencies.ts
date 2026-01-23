import { EstimateMode } from '@server/external/bitcoinRpc.js';
import TransferPriority from '@server/model/currency/transferPriority.js';

export function toEstimateMode(priority?: TransferPriority): EstimateMode {
    switch (priority) {
        case 'important':
            return 'conservative';
        case 'normal':
            return 'economical';
        case 'unimportant':
            return 'economical';
        default:
            return 'economical';
    }
}

export function toPriorityNumber(priority?: TransferPriority): number {
    switch (priority) {
        case 'important':
            return 3;
        case 'normal':
            return 2;
        case 'unimportant':
            return 1;
        default:
            return 1;
    }
}

export function toSats(btc: number) {
    const sats = BigInt(Math.round(btc * 1e8));

    return sats;
}

export function toBTC(sats: bigint) {
    const btc = Number(sats) / 1e8;

    return btc;
}
