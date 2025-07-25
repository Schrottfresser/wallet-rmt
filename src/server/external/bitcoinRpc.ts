import RPC from "@server/external/rpc.js";

export default class BitcoinRPC extends RPC {
    constructor(url: string, username?: string, password?: string) {
        super(url, "2.0", "bitcoin", username, password);
    }

    public getbalance(wallet: string) {
        const walletPath = `wallet/${wallet}`;

        const result = this.request(walletPath, "getbalance");

        return result;
    }
}
