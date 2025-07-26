import RPC from "@server/external/rpc.js";

interface ListwalletdirResponse {
    wallets: [
        {
            name: string;
        }
    ];
}

interface GetbalancesResponse {
    mine: {
        trusted: number;
        untrusted_pending: number;
        immature: number;
        used?: number;
    };

    watchonly?: {
        trusted: number;
        untrusted_pending: number;
        immature: number;
    };

    lastprocessedblock: {
        hash: string;
        height: number;
    };
}

export default class BitcoinRPC extends RPC {
    constructor(url: string, username?: string, password?: string) {
        super(url, "2.0", "bitcoin", username, password);
    }

    public async listwalletdir() {
        const wallets = (
            await this.request<ListwalletdirResponse>("listwalletdir")
        ).wallets;

        return wallets;
    }

    public async createwallet(wallet: string, passphrase?: string) {
        await this.request("createwallet", undefined, [
            wallet,
            false,
            false,
            passphrase,
        ]);
    }

    public async getbalances(wallet: string) {
        const walletPath = `wallet/${wallet}`;

        const result = await this.request<GetbalancesResponse>(
            "getbalances",
            walletPath
        );

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

        await this.request("encryptwallet", walletPath, [passphrase]);
    }

    public async walletpassphrasechange(
        wallet: string,
        oldpassphrase: string,
        newpassphrase: string
    ) {
        const walletPath = `wallet/${wallet}`;

        await this.request("walletpassphrasechange", walletPath, [
            oldpassphrase,
            newpassphrase,
        ]);
    }

    public async walletpassphrase(
        wallet: string,
        passphrase: string,
        timeout: number
    ) {
        const walletPath = `wallet/${wallet}`;

        await this.request("walletpassphrase", walletPath, [
            passphrase,
            timeout,
        ]);
    }

    public async walletlock(wallet: string) {
        const walletPath = `wallet/${wallet}`;

        await this.request("walletlock", walletPath);
    }
}
