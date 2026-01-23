import GetBalanceResult from '@server/model/currency/getBalanceResult.js';
import GetTransferResult from '@server/model/currency/getTransferResult.js';
import TransferPriority from '@server/model/currency/transferPriority.js';
import { WalletDoc, WalletType } from '@server/model/mongoose/wallet.js';
import { UserDoc } from '@server/model/mongoose/user.js';

export default abstract class CryptoWalletService {
    protected wallet: WalletDoc;
    protected user: UserDoc;

    protected constructor(wallet: WalletDoc, user: UserDoc) {
        this.wallet = wallet;
        this.user = user;
    }

    /**
     * Gets the model of the wallet
     * @returns the wallet model
     */
    public getWallet(): WalletDoc {
        return this.wallet;
    }

    /**
     * Gets the related user name
     * @returns the user name
     */
    public getUsername(): string {
        return this.user.username;
    }

    /**
     * Gets the type of the wallet
     * @returns the wallet type
     */
    public abstract getType(): WalletType;

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
    public abstract createAddress(): Promise<string>;

    /**
     * Gets the balance of the wallet
     * @returns the balances in an object
     */
    public abstract getBalance(): Promise<GetBalanceResult>;

    /**
     * Initiates a transfer from the wallet
     * @param address the address to send to
     * @param amount the amount to send
     * @param priority the priority to give the transfer
     * @param subtractFee subtracts the calculated fee from the specified amount
     * @returns the transaction id
     */
    public abstract transfer(
        address: string,
        amount: bigint,
        priority?: TransferPriority,
        subtractFee?: boolean,
    ): Promise<string>;

    /**
     * Gets the transaction by the given transferId inside the specified wallet
     * @param transferId id of the transaction to get
     * @returns the wallet transaction
     */
    public abstract getTransfer(transferId: string): Promise<GetTransferResult>;

    /**
     * Gets all transactions of the wallet
     * @returns the list of all wallet transactions
     */
    public abstract getAllTransfers(): Promise<GetTransferResult[]>;

    /**
     * Opens the wallet
     * @param password the wallet password if locked
     */
    public abstract open(password?: string): Promise<void>;

    /**
     * Closes the wallet
     */
    public abstract close(): Promise<void>;
}
