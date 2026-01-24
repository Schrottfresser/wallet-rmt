import BitcoinRPC from '@server/external/bitcoinRpc.js';
import CryptoWalletService from '@server/service/wallet/crypto.js';
import { toBTC, toEstimateMode, toSats } from '@server/util/currency.js';
import GetBalanceResult from '@server/model/currency/getBalanceResult.js';
import GetTransferResult from '@server/model/currency/getTransferResult.js';
import TransferPriority from '@server/model/currency/transferPriority.js';
import { WalletDoc, WalletType } from '@server/model/mongoose/wallet.js';
import PQueue from 'p-queue';
import { UserDoc } from '@server/model/mongoose/user.js';
import env from '@server/env.js';

export default class BitcoinWalletService extends CryptoWalletService {
    private rpc: BitcoinRPC;
    private queue: PQueue;

    private constructor(wallet: WalletDoc, user: UserDoc, rpc: BitcoinRPC, queue: PQueue) {
        super(wallet, user);

        this.rpc = rpc;
        this.queue = queue;
    }

    /**
     * Create a BitcoinWalletService
     * @param wallet the wallet to create the service of
     * @param user the owner of the wallet
     * @param url the url of the RPC to use
     * @param username the RPC user
     * @param password the RPC password
     * @returns the BitcoinWalletService
     */
    public static async create(wallet: WalletDoc, user: UserDoc, url: string, username?: string, password?: string) {
        const rpc = new BitcoinRPC(url, username, password);
        const queue = new PQueue({ concurrency: 5 });

        const walletService = new BitcoinWalletService(wallet, user, rpc, queue);
        await queue.add(async () => {
            const remoteName = wallet.remoteName;
            const allWallets = await rpc.listwalletdir();
            if (allWallets.find((wallet) => wallet.name === remoteName)) {
                await walletService.open(password);
            } else {
                await rpc.createwallet(remoteName, password);
                wallet.isLoaded = true;

                await wallet.save();
            }
        });

        return walletService;
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
                balance: toSats(result.mine.untrusted_pending),
                unlockedBalance: toSats(result.mine.trusted),
            };

            return response;
        });
    }

    public async transfer(address: string, amount: bigint, priority?: TransferPriority, subtractFee?: boolean) {
        return this.queue.add(async () => {
            const estimateMode = toEstimateMode(priority);

            const result = await this.rpc.sendtoaddress(
                this.wallet.remoteName,
                address,
                toBTC(amount),
                subtractFee,
                true,
                estimateMode,
            );

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
                amount: toSats(result.amount),
                fee: toSats(result.fee),
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
                amount: toSats(transaction.amount),
                fee: toSats(transaction.fee),
                confirmations: transaction.confirmations,
                blockHeight: transaction.blockheight,
                timestamp: transaction.time,
            }));

            return response;
        });
    }

    public async open(password?: string) {
        if (this.wallet.isLoaded) {
            return;
        }

        await this.rpc.loadwallet(this.wallet.remoteName);

        if (password) {
            await this.rpc.walletpassphrase(this.wallet.remoteName, password, 60 * env.sessionExpirationMins);
        }

        this.wallet.isLoaded = true;
        await this.wallet.save();
    }

    public async close() {
        if (!this.wallet.isLoaded) {
            return;
        }

        await this.rpc.walletlock(this.wallet.remoteName);
        await this.rpc.unloadwallet(this.wallet.remoteName);

        this.wallet.isLoaded = false;
        await this.wallet.save();
    }
}
