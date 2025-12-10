import { ObjectId } from '@server/route/validation/index.js';
import GetBalanceResult from '@server/model/currency/getBalanceResult.js';
import GetTransferResult from '@server/model/currency/getTransferResult.js';
import TransferPriority from '@server/model/currency/transferPriority.js';
import { RemoteType } from '@server/model/remote.js';
import { WalletDoc } from '@server/model/wallet.js';

export default abstract class CryptoWalletService {
    protected wallet: WalletDoc;

    constructor(wallet: WalletDoc) {
        this.wallet = wallet;

        this.createWallet();
    }

    /**
     * Gets the wallet id
     * @returns the wallet id
     */
    public getWalletId(): ObjectId {
        return this.wallet._id;
    }

    /**
     * Sets the wallet model to work with
     * @param wallet the model to set to
     */
    public setWallet(wallet: WalletDoc): void {
        this.wallet = wallet;
    }

    /**
     * Gets the type of the wallet
     * @returns the wallet type
     */
    public abstract getType(): RemoteType;

    /**
     * Either adds, removes or changes the password of the wallet
     * @param newPassword the new password to assign to the wallet
     * @param oldPassword the old password if the wallet was already encrypted
     * @returns the wallet
     */
    public abstract changePassword(newPassword: string, oldPassword?: string): Promise<WalletDoc>;

    /**
     * Creates a new recieving address for the wallet
     * @param password the password to assign to the wallet optional based on the currency
     * @returns the new recieving address
     */
    public abstract createAddress(password?: string): Promise<string>;

    /**
     * Gets the balance of the wallet
     * @param password the password to assign to the wallet optional based on the currency
     * @returns the balances in an object
     */
    public abstract getBalance(password?: string): Promise<GetBalanceResult>;

    /**
     * Initiates a transfer from the wallet
     * @param address the address to send to
     * @param amount the amount to send
     * @param password the password to assign to the wallet optional based on the currency
     * @param priority the priority to give the transfer
     * @param subtractFee subtracts the calculated fee from the specified amount
     * @returns the transaction id
     */
    public abstract transfer(
        address: string,
        amount: number,
        password?: string,
        priority?: TransferPriority,
        subtractFee?: boolean,
    ): Promise<string>;

    /**
     * Gets the transaction by the given transferId inside the specified wallet
     * @param transferId id of the transaction to get
     * @param password the password to assign to the wallet optional based on the currency
     * @returns the wallet transaction
     */
    public abstract getTransfer(transferId: string, password?: string): Promise<GetTransferResult>;

    /**
     * Gets all transactions of the wallet
     * @param password the password to assign to the wallet optional based on the currency
     * @returns the list of all wallet transactions
     */
    public abstract getAllTransfers(password?: string): Promise<GetTransferResult[]>;

    protected abstract createWallet(password?: string): Promise<void>;
}
