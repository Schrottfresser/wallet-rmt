import MoneroWalletRPC from '@server/external/moneroWalletRpc.js';
import CryptoWalletService from '@server/service/wallet/crypto.js';
import { toPriorityNumber } from '@server/util/currencies.js';
import GetBalanceResult from '@server/model/currency/getBalanceResult.js';
import GetTransferResult from '@server/model/currency/getTransferResult.js';
import TransferPriority from '@server/model/currency/transferPriority.js';
import { RemoteType } from '@server/model/remote.js';
import { WalletDoc } from '@server/model/wallet.js';

export default class MoneroWalletService extends CryptoWalletService {
    private rpc: MoneroWalletRPC;

    constructor(wallet: WalletDoc, url: string, username?: string, password?: string) {
        super(wallet);

        this.rpc = new MoneroWalletRPC(url, username, password);
    }

    public getType(): RemoteType {
        return 'monero';
    }

    public async changePassword(newPassword: string, oldPassword?: string) {
        await this.open(oldPassword);

        await this.rpc.change_wallet_password(oldPassword, newPassword);

        this.wallet.isLocked = !!newPassword;
        await this.wallet.save();

        await this.close();
        return this.wallet;
    }

    public async createAddress(password?: string) {
        await this.open(password);

        const result = await this.rpc.create_address(0);

        await this.close();
        return result.address;
    }

    public async getBalance(password?: string) {
        await this.open(password);

        const result = await this.rpc.get_balance(0);
        const response: GetBalanceResult = {
            balance: result.balance,
            unlockedBalance: result.unlocked_balance,
        };

        await this.close();
        return response;
    }

    public async transfer(
        address: string,
        amount: number,
        password?: string,
        priority?: TransferPriority,
        subtractFee?: boolean,
    ) {
        await this.open(password);

        const priorityNumber = toPriorityNumber(priority);
        const result = await this.rpc.transfer(amount, address, priorityNumber, undefined, undefined, subtractFee);

        await this.close();
        return result.tx_hash;
    }

    public async getTransfer(transferId: string, password?: string) {
        await this.open(password);

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

        await this.close();
        return response;
    }

    public async getAllTransfers(password?: string) {
        await this.open(password);

        const result = await this.rpc.get_transfers();
        const allTransfers = [...result.failed, ...result.in, ...result.out, ...result.pending, ...result.pool];
        const response: GetTransferResult[] = allTransfers.map((transfer) => ({
            transactionId: transfer.txid,
            address: transfer.address,
            amount: transfer.amount,
            fee: transfer.fee,
            confirmations: transfer.confirmations,
            blockHeight: transfer.height,
            timestamp: transfer.timestamp,
        }));

        await this.close();
        return response;
    }

    protected async createWallet(password?: string) {
        await this.rpc.create_wallet(this.wallet.remoteName, password);
    }

    private async open(password?: string) {
        await this.rpc.open_wallet(this.wallet.remoteName, password);

        this.wallet.isLoaded = true;
        await this.wallet.save();
    }

    private async close() {
        await this.rpc.close_wallet();

        this.wallet.isLoaded = false;
        await this.wallet.save();
    }
}
