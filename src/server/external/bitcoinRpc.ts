import RPC from "@server/external/rpc.js";

export default class BitcoinRPC extends RPC {
    constructor(url: string, username?: string, password?: string) {
        super(url, "2.0", "bitcoin", username, password);
    }

    public async listwalletdir() {
        const wallets = (
            await this.request<{ wallets: [{ name: string }] }>("listwalletdir")
        ).wallets;

        return wallets;
    }

    public async createwallet(wallet: string, passphrase?: string) {
        await this.request<{ name: string }>("createwallet", undefined, [
            wallet,
            false,
            false,
            passphrase,
        ]);
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

    public async encryptwallet(wallet: string, passphrase: string) {
        const walletPath = `wallet/${wallet}`;

        const result = await this.request<string>("encryptwallet", walletPath, [
            passphrase,
        ]);

        return result;
    }

    public async walletpassphrase(
        wallet: string,
        passphrase: string,
        timeout: number
    ) {
        const walletPath = `wallet/${wallet}`;

        await this.request<string>("walletpassphrase", walletPath, [
            passphrase,
            timeout,
        ]);
    }

    public async walletlock(wallet: string) {
        const walletPath = `wallet/${wallet}`;

        await this.request<string>("walletlock", walletPath);
    }
}
