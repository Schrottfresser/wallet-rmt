export function bigIntReplacer(_key: string, value: unknown) {
    if (typeof value === 'bigint') {
        return `BigInt(${value.toString()})`;
    }

    return value;
}

export function parseJSON(text: string) {
    return JSON.parse(text, (_key, value) => {
        if (typeof value === 'string') {
            const match = value.match(/^BigInt\((-?\d+)\)$/)?.[1];
            if (match) {
                return BigInt(match);
            }
        }

        return value;
    });
}
