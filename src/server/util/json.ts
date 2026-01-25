export function bigIntReplacer(_key: string, value: unknown) {
    if (typeof value === 'bigint') {
        return `BigInt(${value.toString()})`;
    }

    return value;
}

export function bigIntReviver(_key: string, value: unknown) {
    if (typeof value === 'string') {
        const match = value.match(/^BigInt\((-?\d+)\)$/)?.[1];
        if (match) {
            return BigInt(match);
        }
    }

    return value;
}
