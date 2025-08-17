interface GetTransferResult {
    transactionId: string;
    address: string;
    amount: number;
    fee: number;
    confirmations: number;
    blockHeight: number;
    timestamp: number;
}

export default GetTransferResult;
