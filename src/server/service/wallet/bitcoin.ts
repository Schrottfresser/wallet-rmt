import BitcoinRPC from '@server/external/bitcoinRpc.js';
import CryptoWalletService from '@server/service/wallet/crypto.js';
import { toEstimateMode } from '@server/util/currencies.js';
import GetBalanceResult from '@server/model/currency/getBalanceResult.js';
import GetTransferResult from '@server/model/currency/getTransferResult.js';
import TransferPriority from '@server/model/currency/transferPriority.js';
import { WalletDoc, WalletType } from '@server/model/wallet.js';
import PQueue from 'p-queue';

export default class BitcoinWalletService extends CryptoWalletService {
    private rpc: BitcoinRPC;
    private queue: PQueue;

    constructor(wallet: WalletDoc, url: string, username?: string, password?: string) {
        super(wallet);

        this.rpc = new BitcoinRPC(url, username, password);
        this.queue = new PQueue({ concurrency: 5 });
    }

    public getType(): WalletType {
        return 'bitcoin';
    }

    public async changePassword(newPassword: string, oldPassword?: string) {
        return this.queue.add(async () => {
            if (oldPassword) {
                await this.rpc.walletpassphrasechange(this.wallet.remoteName, oldPassword, newPassword);
            } else {
                await this.rpc.encryptwallet(this.wallet.remoteName, newPassword);
            }

            this.wallet.isLocked = !!newPassword;
            await this.wallet.save();

            return this.wallet;
        });
    }

    public async createAddress() {
        return this.queue.add(async () => {
            const newAddress = await this.rpc.getnewaddress(this.wallet.remoteName);

            this.wallet.addresses.push(newAddress);
            await this.wallet.save();

            return newAddress;
        });
    }

    public async getBalance() {
        return this.queue.add(async () => {
            const result = await this.rpc.getbalances(this.wallet.remoteName);
            const response: GetBalanceResult = {
                balance: result.mine.untrusted_pending,
                unlockedBalance: result.mine.trusted,
            };

            return response;
        });
    }

    public async transfer(
        address: string,
        amount: number,
        password?: string,
        priority?: TransferPriority,
        subtractFee?: boolean,
    ) {
        return this.queue.add(async () => {
            await this.open(password);

            const estimateMode = toEstimateMode(priority);

            const result = await this.rpc.sendtoaddress(
                this.wallet.remoteName,
                address,
                amount,
                subtractFee,
                true,
                estimateMode,
            );

            await this.close();
            return result;
        });
    }

    public async getTransfer(transferId: string) {
        return this.queue.add(async () => {
            const result = await this.rpc.gettransaction(this.wallet.remoteName, transferId);
            const primaryDetail = result.details.sort((a, b) => a.vout - b.vout)[0];
            const response: GetTransferResult = {
                transactionId: result.txid,
                address: primaryDetail.address,
                amount: result.amount,
                fee: result.fee,
                confirmations: result.confirmations,
                blockHeight: result.blockheight,
                timestamp: result.time,
            };

            return response;
        });
    }

    public async getAllTransfers() {
        return this.queue.add(async () => {
            const result = await this.rpc.listtransactions(this.wallet.remoteName);
            const response: GetTransferResult[] = result.map((transaction) => ({
                transactionId: transaction.txid,
                address: transaction.address,
                amount: transaction.amount,
                fee: transaction.fee,
                confirmations: transaction.confirmations,
                blockHeight: transaction.blockheight,
                timestamp: transaction.time,
            }));

            return response;
        });
    }

    protected async createWallet(password?: string) {
        const remoteName = this.wallet.remoteName;

        const allWallets = await this.rpc.listwalletdir();
        if (allWallets.find((wallet) => wallet.name === remoteName)) {
            await this.open(password);
        } else {
            await this.rpc.createwallet(remoteName, password);
        }
    }

    private async open(password?: string) {
        await this.rpc.loadwallet(this.wallet.remoteName);

        if (password) {
            await this.rpc.walletpassphrase(
                this.wallet.remoteName,
                password,
                60 * 5, // 5 minutes
            );
        }

        this.wallet.isLoaded = true;
        await this.wallet.save();
    }

    private async close() {
        await this.rpc.walletlock(this.wallet.remoteName);
        await this.rpc.unloadwallet(this.wallet.remoteName);

        this.wallet.isLoaded = false;
        await this.wallet.save();
    }
}
