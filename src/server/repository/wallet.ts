import { ObjectId } from '@server/route/validation/index.js';
import BitcoinWalletService from '@server/service/wallet/bitcoin.js';
import CryptoWalletService from '@server/service/wallet/crypto.js';
import MoneroWalletService from '@server/service/wallet/monero.js';
import Wallet, { IWallet, WalletDoc } from '@server/model/mongoose/wallet.js';
import { LRUCache } from 'lru-cache';
import env from '@server/env.js';
import { UserDoc } from '@server/model/mongoose/user.js';
import { useUser } from '@server/route/hook/user.js';

class WalletRepository {
    private cache: LRUCache<ObjectId, CryptoWalletService>;

    constructor() {
        this.cache = new LRUCache<ObjectId, CryptoWalletService>({
            max: 10,
            ttl: 1000 * 60 * 60, // 1 hour
        });
    }

    public async findById(id: ObjectId, username: string): Promise<CryptoWalletService | undefined> {
        const user = await useUser(username, true);

        let cryptoWalletService = this.cache.get(id);

        if (!cryptoWalletService) {
            const wallet = await Wallet.findById(id);
            if (!wallet) return undefined;

            cryptoWalletService = this.buildCyptoWalletService(wallet, user);
            cryptoWalletService?.setWallet(wallet);

            this.cache.set(id, cryptoWalletService);
        }

        const walletUsername = cryptoWalletService?.getUsername();
        if (walletUsername !== username) cryptoWalletService = undefined;

        return cryptoWalletService;
    }

    public async create(wallet: IWallet, username: string): Promise<CryptoWalletService | undefined> {
        const user = await useUser(username, true);

        const walletModel = await Wallet.create(wallet);

        const cryptoWalletService = this.buildCyptoWalletService(walletModel, user);
        cryptoWalletService?.setWallet(walletModel);

        this.cache.set(walletModel._id, cryptoWalletService);
        return cryptoWalletService;
    }

    public invalidate(id: ObjectId) {
        this.cache.delete(id);
    }

    private buildCyptoWalletService(wallet: WalletDoc, user: UserDoc): CryptoWalletService | undefined {
        let walletService: CryptoWalletService | undefined = undefined;
        switch (wallet.type) {
            case 'bitcoin':
                if (env.bitcoinEnable) {
                    walletService = new BitcoinWalletService(
                        wallet,
                        user,
                        env.bitcoinRpcUrl,
                        env.bitcoinRpcUser,
                        env.bitcoinRpcPassword,
                    );
                    break;
                }
            case 'monero':
                if (env.moneroEnable) {
                    walletService = new MoneroWalletService(
                        wallet,
                        user,
                        env.moneroWalletRpcUrl,
                        env.moneroWalletRpcUser,
                        env.moneroWalletRpcPassword,
                    );
                    break;
                }
        }

        return walletService;
    }
}

const walletRepository = new WalletRepository();

export default walletRepository;
