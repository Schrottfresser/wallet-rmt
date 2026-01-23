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
