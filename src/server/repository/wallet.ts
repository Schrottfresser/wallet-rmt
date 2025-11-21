import { ObjectId } from "@server/route/validation/index.js";
import BitcoinWalletService from "@server/service/wallet/bitcoin.js";
import CryptoWalletService from "@server/service/wallet/crypto.js";
import MoneroWalletService from "@server/service/wallet/monero.js";
import Remote, { IRemoteWithMeta } from "@server/model/remote.js";
import Wallet, { IWallet, WalletDoc } from "@server/model/wallet.js";
import { LRUCache } from "lru-cache";

class WalletRepository {
    private cache: LRUCache<ObjectId, CryptoWalletService>;

    constructor() {
        this.cache = new LRUCache<ObjectId, CryptoWalletService>({
            max: 10,
            ttl: 1000 * 60 * 60, // 1 hour
        });
    }

    public async findById(
        id: ObjectId
    ): Promise<CryptoWalletService | undefined> {
        if (this.cache.has(id)) {
            return this.cache.get(id)!;
        }

        const wallet = await Wallet.findById(id);
        if (!wallet) return undefined;

        const remote = await Remote.findById(wallet.remote);
        if (!remote) return undefined;

        const cryptoWalletService = this.buildCyptoWalletService(
            remote,
            wallet
        );
        cryptoWalletService?.setWallet(wallet);

        this.cache.set(id, cryptoWalletService);
        return cryptoWalletService;
    }

    public async create(
        wallet: IWallet
    ): Promise<CryptoWalletService | undefined> {
        const remote = await Remote.findById(wallet.remote);
        if (!remote) return undefined;

        const walletModel = await Wallet.create(wallet);

        const cryptoWalletService = this.buildCyptoWalletService(
            remote,
            walletModel
        );
        cryptoWalletService?.setWallet(walletModel);

        this.cache.set(walletModel._id, cryptoWalletService);
        return cryptoWalletService;
    }

    public invalidate(id: ObjectId) {
        this.cache.delete(id);
    }

    private buildCyptoWalletService(
        remote: IRemoteWithMeta,
        wallet: WalletDoc
    ): CryptoWalletService | undefined {
        let walletService: CryptoWalletService;
        switch (remote.type) {
            case "bitcoin":
                walletService = new BitcoinWalletService(
                    wallet,
                    remote.url,
                    remote.username,
                    remote.password
                );
                break;
            case "monero":
                walletService = new MoneroWalletService(
                    wallet,
                    remote.url,
                    remote.username,
                    remote.password
                );
                break;
            default:
                return undefined;
        }
    }
}

const walletRepository = new WalletRepository();

export default walletRepository;
