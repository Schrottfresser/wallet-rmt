import BitcoinIcon from '@client/components/icons/BitcoinIcon.js';
import MoneroIcon from '@client/components/icons/MoneroIcon.js';
import { WalletType } from '@server/model/mongoose/wallet.js';

export function getWalletIcon(type: WalletType) {
    switch (type) {
        case 'bitcoin':
            return BitcoinIcon;
        case 'monero':
            return MoneroIcon;
    }
}

export function getWalletTypeLabel(type: WalletType) {
    switch (type) {
        case 'bitcoin':
            return 'Bitcoin';
        case 'monero':
            return 'Monero';
    }
}

export function formatBTC(sats: bigint): string {
    const formatted = formatCrypto(sats, 8, 'BTC');

    return formatted;
}

export function formatXMR(piconero: bigint): string {
    const formatted = formatCrypto(piconero, 12, 'XMR');

    return formatted;
}

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
