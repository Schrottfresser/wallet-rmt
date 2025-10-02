import MoneroWalletRPC from "@server/external/moneroWalletRpc.js";
import CryptoWalletController from "@server/lib/controller/wallet/crypto.js";
import { toPriorityNumber } from "@server/lib/helper/currencies.js";
import GetBalanceResult from "@server/model/currency/getBalanceResult.js";
import GetTransferResult from "@server/model/currency/getTransferResult.js";
import TransferPriority from "@server/model/currency/transferPriority.js";
import { RemoteType } from "@server/model/remote.js";
import { WalletDoc } from "@server/model/wallet.js";

export default class MoneroWalletController extends CryptoWalletController {
    private rpc: MoneroWalletRPC;

    constructor(
        wallet: WalletDoc,
        url: string,
        username?: string,
        password?: string
    ) {
        super(wallet);

        this.rpc = new MoneroWalletRPC(url, username, password);
    }

    public getType(): RemoteType {
        return "monero";
    }

    public async changePassword(newPassword: string, oldPassword?: string) {
        await this.rpc.change_wallet_password(oldPassword, newPassword);

        this.wallet.isLocked = !!newPassword;
        await this.wallet.save();

        return this.wallet;
    }

    public async createAddress() {
        const result = await this.rpc.create_address(0);

        return result.address;
    }

    public async getBalance() {
        const result = await this.rpc.get_balance(0);
        const response: GetBalanceResult = {
            balance: result.balance,
            unlockedBalance: result.unlocked_balance,
        };

        return response;
    }

    public async transfer(
        amount: number,
        address: string,
        priority?: TransferPriority,
        substractFee?: boolean
    ) {
        const priorityNumber = toPriorityNumber(priority);
        const result = await this.rpc.transfer(
            amount,
            address,
            priorityNumber,
            undefined,
            undefined,
            substractFee
        );

        return result.tx_hash;
    }

    public async getTransfer(transferId: string) {
        const result = await this.rpc.get_transfer_by_txid(transferId);
        const response: GetTransferResult = {
            transactionId: result.txid,
            address: result.address,
            amount: result.amount,
            fee: result.fee,
            confirmations: result.confirmations,
            blockHeight: result.height,
            timestamp: result.timestamp,
        };

        return response;
    }

    public async getAllTransfers() {
        const result = await this.rpc.get_transfers();
        const allTransfers = [
            ...result.failed,
            ...result.in,
            ...result.out,
            ...result.pending,
            ...result.pool,
        ];
        const response: GetTransferResult[] = allTransfers.map((transfer) => ({
            transactionId: transfer.txid,
            address: transfer.address,
            amount: transfer.amount,
            fee: transfer.fee,
            confirmations: transfer.confirmations,
            blockHeight: transfer.height,
            timestamp: transfer.timestamp,
        }));

        return response;
    }

    public async open(password?: string) {
        await this.rpc.open_wallet(this.wallet.remoteName, password);

        this.wallet.isLoaded = true;
        await this.wallet.save();
    }

    public async close() {
        await this.rpc.close_wallet();

        this.wallet.isLoaded = false;
        await this.wallet.save();
    }

    protected async createWallet(password?: string) {
        await this.rpc.create_wallet(this.wallet.remoteName, password);
    }
}
