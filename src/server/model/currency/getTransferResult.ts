interface GetTransferResult {
    transactionId: string;
    address: string;
    amount: bigint;
    fee?: bigint;
    confirmations: number;
    blockHeight: number;
    timestamp: number;
}

export default GetTransferResult;
