import GetBalanceResult from "@server/model/currency/getBalanceResult.js";
import GetTransferResult from "@server/model/currency/getTransferResult.js";
import TransferPriority from "@server/model/currency/transferPriority.js";
import { RemoteType } from "@server/model/remote.js";
import { WalletDoc } from "@server/model/wallet.js";

export default abstract class CryptoWalletController {
    protected wallet: WalletDoc;

    constructor(wallet: WalletDoc) {
        this.wallet = wallet;

        this.createWallet();
    }

    public setWallet(wallet: WalletDoc) {
        this.wallet = wallet;
    }

    public abstract getType(): RemoteType;

    public abstract changePassword(
        newPassword: string,
        oldPassword?: string
    ): Promise<WalletDoc>;

    public abstract createAddress(): Promise<string>;

    public abstract getBalance(): Promise<GetBalanceResult>;

    public abstract transfer(
        amount: number,
        address: string,
        priority?: TransferPriority,
        substractFee?: boolean
    ): Promise<string>;

    public abstract getTransfer(transferId: string): Promise<GetTransferResult>;

    public abstract getAllTransfers(): Promise<GetTransferResult[]>;

    public abstract open(password?: string): Promise<void>;

    public abstract close(): Promise<void>;

    protected abstract createWallet(password?: string): Promise<void>;
}
