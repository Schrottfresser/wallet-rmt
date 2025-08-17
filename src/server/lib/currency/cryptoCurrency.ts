import GetBalanceResult from "@server/model/currency/getBalanceResult.js";
import GetTransferResult from "@server/model/currency/getTransferResult.js";
import TransferPriority from "@server/model/currency/transferPriority.js";

export default abstract class CryptoCurrency {
    public abstract createWallet(walletName: string, password?: string): void;

    public abstract changePassword(
        walletName: string,
        oldPassword?: string,
        newPassword?: string
    ): void;

    public abstract createAddress(walletName: string): string;

    public abstract getBalance(walletName: string): GetBalanceResult;

    public abstract transfer(
        walletName: string,
        amount: number,
        address: string,
        priority: TransferPriority,
        substractFee: boolean
    ): string;

    public abstract getTransfer(
        walletName: string,
        transactionId: string
    ): GetTransferResult;

    public abstract getAllTransfers(walletName: string): GetTransferResult[];

    protected abstract openWallet(walletName: string, password?: string): void;

    protected abstract closeWallet(): void;
}
