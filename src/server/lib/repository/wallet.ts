import { ObjectId } from "@server/api/validation/index.js";
import BitcoinWalletController from "@server/lib/controller/wallet/bitcoin.js";
import CryptoWalletController from "@server/lib/controller/wallet/crypto.js";
import MoneroWalletController from "@server/lib/controller/wallet/monero.js";
import Remote, { IRemoteWithMeta } from "@server/model/remote.js";
import Wallet, { WalletDoc } from "@server/model/wallet.js";
import { LRUCache } from "lru-cache";

class WalletRepository {
    private cache: LRUCache<ObjectId, CryptoWalletController>;

    constructor() {
        this.cache = new LRUCache<ObjectId, CryptoWalletController>({
            max: 10,
            ttl: 1000 * 60 * 60, // 1 hour
        });
    }

    public async findById(
        id: ObjectId
    ): Promise<CryptoWalletController | undefined> {
        if (this.cache.has(id)) {
            return this.cache.get(id)!;
        }

        const wallet = await Wallet.findById(id);
        if (!wallet) return undefined;

        const remote = await Remote.findById(wallet.remote);
        if (!remote) return undefined;

        const cryptoWalletController = this.buildCyptoWalletController(
            remote,
            wallet
        );
        cryptoWalletController?.setWallet(wallet);

        this.cache.set(id, cryptoWalletController);
        return cryptoWalletController;
    }

    public async findByEntity(
        wallet: WalletDoc
    ): Promise<CryptoWalletController | undefined> {
        if (this.cache.has(wallet._id)) {
            return this.cache.get(wallet._id)!;
        }

        const remote = await Remote.findById(wallet.remote);
        if (!remote) return undefined;

        const cryptoWalletController = this.buildCyptoWalletController(
            remote,
            wallet
        );
        cryptoWalletController?.setWallet(wallet);

        this.cache.set(wallet._id, cryptoWalletController);
        return cryptoWalletController;
    }

    public invalidate(id: ObjectId) {
        this.cache.delete(id);
    }

    private buildCyptoWalletController(
        remote: IRemoteWithMeta,
        wallet: WalletDoc
    ): CryptoWalletController | undefined {
        let walletController: CryptoWalletController;
        switch (remote.type) {
            case "bitcoin":
                walletController = new BitcoinWalletController(
                    wallet,
                    remote.url,
                    remote.username,
                    remote.password
                );
                break;
            case "monero":
                walletController = new MoneroWalletController(
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

const remoteRepository = new WalletRepository();

export default remoteRepository;
