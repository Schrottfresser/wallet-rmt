import { ObjectId } from "@server/api/validation/index.js";
import BitcoinRPC from "@server/external/bitcoinRpc.js";
import Remote, { IRemote } from "@server/model/remote.js";

class BitcoinRepository {
    private cache = new Map<ObjectId, BitcoinRPC>();

    public async findById(id: ObjectId) {
        if (this.cache.has(id)) {
            return this.cache.get(id)!;
        }

        const remote = await Remote.findById(id);
        if (!remote) return undefined;

        const entity = new BitcoinRPC(
            remote.url,
            remote.username,
            remote.password
        );

        this.cache.set(id, entity);
        return entity;
    }

    public async findByIdAndEntity(id: ObjectId, remote: IRemote) {
        if (this.cache.has(id)) {
            return this.cache.get(id)!;
        }

        const entity = new BitcoinRPC(
            remote.url,
            remote.username,
            remote.password
        );

        this.cache.set(id, entity);
        return entity;
    }

    public clearCache(id: ObjectId) {
        this.cache.delete(id);
    }
}

const bitcoinRepository = new BitcoinRepository();

export default bitcoinRepository;
