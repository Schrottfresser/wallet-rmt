import InternalServerError from "@server/errors/internalServerError.js";
import RPC from "@server/external/rpc.js";

type EstimateMode = "unset" | "economical" | "conservative";

type TransactionCategory =
    | "send"
    | "receive"
    | "generate"
    | "immature"
    | "orphan";

type ReplacableByFee = "yes" | "no" | "unknown";

interface ListwalletdirResult {
    wallets: [
        {
            name: string;
        }
    ];
}

interface GetbalancesResult {
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

interface ListtransactionsResult {
    involvesWatchonly?: boolean;
    address: string;
    category: TransactionCategory;
    amount: number;
    label?: string;
    vout: number;
    fee: number;
    confirmations: number;
    generated?: boolean;
    trusted?: boolean;
    blockhash: string;
    blockheight: number;
    blockindex: number;
    blocktime: number;
    txid: string;
    walletconflicts: [string];
    time: number;
    timerecieved: number;
    comment?: string;
    "bip125-replacable": ReplacableByFee;
    abandoned?: boolean;
}

interface GettransactionResult {
    amount: number;
    fee: number;
    confirmations: number;
    generated?: boolean;
    trusted?: boolean;
    blockhash: string;
    blockheight: number;
    blockindex: number;
    blocktime: number;
    txid: string;
    walletconflicts: [string];
    time: number;
    timerecieved: number;
    comment?: string;
    "bip125-replacable": ReplacableByFee;
    details: [
        {
            involvesWatchonly: boolean;
            address: string;
            category: TransactionCategory;
            amount: number;
            label?: string;
            vout: number;
            fee: number;
            abandoned: boolean;
        }
    ];
    hex: string;
}

const RPC_VERSION = "2.0";
const RPC_ID = "wallet-rmt";

export default class BitcoinRPC extends RPC {
    constructor(url: string, username?: string, password?: string) {
        super(url, RPC_VERSION, RPC_ID, username, password);
    }

    public async listwalletdir() {
        const wallets = (
            await this.request<ListwalletdirResult>("listwalletdir")
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

        const result = await this.request<GetbalancesResult>(
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

    public async sendtoaddress(
        wallet: string,
        address: string,
        amount: number,
        substractFee?: boolean,
        replacable?: boolean,
        confirmationTarget?: number,
        estimateMode?: EstimateMode
    ) {
        const walletPath = `wallet/${wallet}`;

        const result = await this.request<string>("sendtoaddress", walletPath, [
            address,
            amount,
            undefined,
            undefined,
            substractFee,
            replacable,
            confirmationTarget,
            estimateMode,
        ]);

        return result;
    }

    public async listtransactions(
        wallet: string,
        count?: number,
        skip?: number
    ) {
        const walletPath = `wallet/${wallet}`;

        const results = await this.request<[ListtransactionsResult]>(
            "listtransactions",
            walletPath,
            [undefined, count, skip]
        );

        return results;
    }

    public async settxfee(wallet: string, amount: number) {
        const walletPath = `wallet/${wallet}`;

        const result = await this.request<boolean>("settxfee", walletPath, [
            amount,
        ]);

        if (!result) {
            throw new InternalServerError("Setting the transaction fee failed");
        }
    }

    public async gettransaction(wallet: string, txid: string) {
        const walletPath = `wallet/${wallet}`;

        const result = await this.request<GettransactionResult>(
            "gettransaction",
            walletPath,
            [txid]
        );

        return result;
    }
}
