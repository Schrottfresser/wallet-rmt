import { EstimateMode } from '@server/external/bitcoinRpc.js';
import TransferPriority from '@server/model/currency/transferPriority.js';
import { WalletType } from '@server/model/mongoose/wallet.js';

function formatCrypto(input: bigint, decimals: number, suffix: string): string {
    const sign = input < 0n ? '-' : '';
    const value = input < 0n ? -input : input;

    const base = 10n ** BigInt(decimals);
    const whole = value / base;
    const franc = value % base;

    const francStr = franc.toString().padStart(decimals, '0');
    const formatted = `${sign}${whole}.${francStr} ${suffix}`;

    return formatted;
}

type unittype = string | number | bigint;

interface CryptoUnit {
    name: string;
    convert: (input: unittype) => any;
}

interface CurrencyProperties {
    name: string;
    decimals: number;
    units: {
        main: CryptoUnit;
        lesser: CryptoUnit;
    };
    amountRegex: RegExp;
    format: (input: bigint) => string;
}

function toBTC(sats: unittype) {
    const btc = Number(sats) / 10 ** bitcoinProperties.decimals;

    return btc;
}

function toSats(btc: unittype) {
    const sats = BigInt(Math.round(Number(btc) * 10 ** bitcoinProperties.decimals));

    return sats;
}

const bitcoinProperties: CurrencyProperties = {
    name: 'Bitcoin',
    decimals: 8,
    units: {
        main: { name: 'BTC', convert: toBTC },
        lesser: { name: 'sats', convert: toSats },
    },
    amountRegex: /^\d+(\.\d{0,8})?$/,
    format: (input) => formatCrypto(input, bitcoinProperties.decimals, bitcoinProperties.units.main.name),
};

function toXMR(piconero: unittype) {
    const xmr = Number(piconero) / 10 ** moneroProperties.decimals;

    return String(xmr);
}

function toPiconero(xmr: unittype) {
    const piconero = BigInt(Math.round(Number(xmr) * 10 ** moneroProperties.decimals));

    return piconero;
}

const moneroProperties: CurrencyProperties = {
    name: 'Monero',
    decimals: 12,
    units: {
        main: { name: 'XMR', convert: toXMR },
        lesser: { name: 'piconero', convert: toPiconero },
    },
    amountRegex: /^\d+(\.\d{0,12})?$/,
    format: (input) => formatCrypto(input, moneroProperties.decimals, moneroProperties.units.main.name),
};

export const currencyProperties: Record<WalletType, CurrencyProperties> = {
    bitcoin: bitcoinProperties,
    monero: moneroProperties,
};

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
