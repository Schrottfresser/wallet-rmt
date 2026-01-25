import RPC from '@server/external/rpc.js';

interface CreateAccountResult {
    account_index: number;
    address: string;
}

interface GetAccountResult {
    subaddress_accounts: {
        account_index: number;
        balance: string;
        unlocked_balance: string;
        base_address: string;
    }[];
    total_balance: string;
    total_unlocked_balance: string;
}

interface CreateAddressResult {
    address: string;
    address_index: number;
    address_indeces: number;
    addresses: string[];
}

interface GetAddressResult {
    address: string;
    addresses: {
        address: string;
        label: string;
        address_index: number;
        used: boolean;
    }[];
}

interface GetBalanceResult {
    balance: string;
    unlocked_balance: string;
    multisig_import_needed: boolean;
    time_to_unlock: number;
    blocks_to_unlock: number;
    per_subaddress: {
        account_index: number;
        address_index: number;
        address: string;
        balance: string;
        unlocked_balance: string;
        label: string;
        num_unspent_outputs: number;
        time_to_unlock: number;
        blocks_to_unlock: number;
    }[];
}

interface TransferResult {
    amount: string;
    fee: string;
    multisig_txset: string;
    tx_hash: string;
    unsigned_txset: string;
}

type TransferType = 'in' | 'out' | 'pending' | 'failed' | 'pool';

interface Transfer {
    address: string;
    amount: string;
    confirmations: number;
    double_spend_seen: boolean;
    fee: string;
    height: number;
    locked: boolean;
    note: string;
    payment_id: string;
    destinations?: {
        amount: string;
        address: string;
    }[];
    subaddr_index: {
        major: number;
        minor: number;
    };
    subaddr_indices?: {
        major: number;
        minor: number;
    }[];
    suggested_confirmations_threshold: number;
    timestamp: number;
    txid: string;
    type: TransferType;
    unlock_time: number;
}

interface GetTransfersResult {
    in: Transfer[];
    out: Transfer[];
    pending: Transfer[];
    failed: Transfer[];
    pool: Transfer[];
}

const RPC_VERSION = '2.0';
const RPC_ID = 'wallet-rmt';

export default class MoneroWalletRPC extends RPC {
    constructor(url: string, username?: string, password?: string) {
        super(url, RPC_VERSION, RPC_ID, username, password);
    }

    public async create_wallet(wallet: string, password?: string) {
        await this.request('create_wallet', undefined, [wallet, password, 'English']);
    }

    public async open_wallet(filename: string, password?: string) {
        await this.request('open_wallet', undefined, [filename, password]);
    }

    public async close_wallet() {
        await this.request('close_wallet');
    }

    public async change_wallet_password(old_password?: string, new_password?: string) {
        await this.request('change_wallet_password', undefined, [old_password, new_password]);
    }

    public async create_account() {
        const result = await this.request<CreateAccountResult>('create_account');

        return result;
    }

    public async get_accounts() {
        const result = await this.request<GetAccountResult>('get_accounts');

        return result;
    }

    public async create_address(accountIndex: number, count?: number) {
        const result = await this.request<CreateAddressResult>('create_address', undefined, [
            accountIndex,
            undefined,
            count,
        ]);

        return result;
    }

    public async get_address(accountIndex: number, address_index: number[]) {
        const result = await this.request<GetAddressResult>('get_address', undefined, [accountIndex, address_index]);

        return result;
    }

    public async get_balance(accountIndex: number, addressIndices?: number[], allAccounts?: boolean) {
        const result = await this.request<GetBalanceResult>('get_balance', undefined, [
            accountIndex,
            addressIndices,
            allAccounts,
        ]);

        return result;
    }

    public async transfer(
        amount: string,
        address: string,
        priority: number,
        accountIndex?: number,
        subaddrIndices?: number,
        substractFee?: boolean,
    ) {
        const result = await this.request<TransferResult>('transfer', undefined, [
            [amount, address],
            accountIndex,
            subaddrIndices,
            substractFee && [0],
            priority,
        ]);

        return result;
    }

    public async get_transfers(
        incoming?: boolean,
        outgoing?: boolean,
        pending?: boolean,
        failed?: boolean,
        pool?: boolean,
        minHeight?: number,
        maxHeight?: boolean,
        accountIndex?: number,
        subaddrIndices?: number[],
        allAccounts?: boolean,
    ) {
        const filterByHeight = Boolean(minHeight || maxHeight);

        const result = await this.request<GetTransfersResult>('get_transfers', undefined, [
            incoming,
            outgoing,
            pending,
            failed,
            pool,
            filterByHeight,
            minHeight,
            maxHeight,
            accountIndex,
            subaddrIndices,
            allAccounts,
        ]);

        return result;
    }

    public async get_transfer_by_txid(txid: string, accountIndex?: number) {
        const result = await this.request<Transfer>('get_transfer_by_txid', undefined, [txid, accountIndex]);

        return result;
    }
}
