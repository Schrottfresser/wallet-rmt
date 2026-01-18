import MoneroWalletRPC from '@server/external/moneroWalletRpc.js';
import CryptoWalletService from '@server/service/wallet/crypto.js';
import { toPriorityNumber } from '@server/util/currencies.js';
import GetBalanceResult from '@server/model/currency/getBalanceResult.js';
import GetTransferResult from '@server/model/currency/getTransferResult.js';
import TransferPriority from '@server/model/currency/transferPriority.js';
import { WalletDoc, WalletType } from '@server/model/mongoose/wallet.js';
import PQueue from 'p-queue';
import { UserDoc } from '@server/model/mongoose/user.js';

export default class MoneroWalletService extends CryptoWalletService {
    private rpc: MoneroWalletRPC;
    private queue: PQueue;

    constructor(wallet: WalletDoc, user: UserDoc, url: string, username?: string, password?: string) {
        super(wallet, user);

        this.rpc = new MoneroWalletRPC(url, username, password);
        this.queue = new PQueue({ concurrency: 1 });

        this.createWallet();
    }

    public getType(): WalletType {
        return 'monero';
    }

    public async changePassword(newPassword: string, oldPassword?: string) {
        return this.queue.add(async () => {
            await this.rpc.change_wallet_password(oldPassword, newPassword);

            this.wallet.isLocked = !!newPassword;
            await this.wallet.save();

            return this.wallet;
        });
    }

    public async createAddress() {
        return this.queue.add(async () => {
            const result = await this.rpc.create_address(0);

            this.wallet.addresses.push(result.address);
            await this.wallet.save();

            return result.address;
        });
    }

    public async getBalance() {
        return this.queue.add(async () => {
            const result = await this.rpc.get_balance(0);
            const response: GetBalanceResult = {
                balance: result.balance,
                unlockedBalance: result.unlocked_balance,
            };

            return response;
        });
    }

    public async transfer(address: string, amount: number, priority?: TransferPriority, subtractFee?: boolean) {
        return this.queue.add(async () => {
            const priorityNumber = toPriorityNumber(priority);
            const result = await this.rpc.transfer(amount, address, priorityNumber, undefined, undefined, subtractFee);

            return result.tx_hash;
        });
    }

    public async getTransfer(transferId: string) {
        return this.queue.add(async () => {
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
        });
    }

    public async getAllTransfers() {
        return this.queue.add(async () => {
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

            return response;
        });
    }

    public async open(password?: string) {
        return this.queue.add(async () => {
            await this.rpc.open_wallet(this.wallet.remoteName, password);

            this.wallet.isLoaded = true;
            await this.wallet.save();
        });
    }

    public async close() {
        return this.queue.add(async () => {
            await this.rpc.close_wallet();

            this.wallet.isLoaded = false;
            await this.wallet.save();
        });
    }

    protected async createWallet(password?: string) {
        return this.queue.add(async () => {
            await this.rpc.create_wallet(this.wallet.remoteName, password);
        });
    }
}
