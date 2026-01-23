export function bigIntReplacer(_key: string, value: unknown) {
    if (typeof value === 'bigint') {
        return `BigInt(${value.toString()})`;
    }

    return value;
}
