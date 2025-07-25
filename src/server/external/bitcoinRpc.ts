import RPC from "@server/external/rpc.js";

export default class BitcoinRPC extends RPC {
    constructor(url: string, username?: string, password?: string) {
        super(url, "2.0", "bitcoin", username, password);
    }

    public async getbalance(wallet: string) {
        const walletPath = `wallet/${wallet}`;

        const result = await this.request<number>("getbalance", walletPath);

        return result;
    }

    public async loadwallet(wallet: string) {
        await this.request("loadwallet", undefined, [wallet]);
    }

    public async unloadwallet(wallet: string) {
        await this.request("unloadwallet", undefined, [wallet]);
    }
}
