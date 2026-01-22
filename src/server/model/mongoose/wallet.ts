import mongoose, { HydratedDocument } from 'mongoose';

export type WalletType = 'bitcoin' | 'monero';

export interface IWallet {
    name: string;
    type: WalletType;
    remoteName: string;
    addresses: string[];
    balance?: bigint;
    untrustedBalance?: number;
    blockHeight?: number;
    isLoaded?: boolean;
    isLocked?: boolean;
    isDirty?: boolean;
}

export const walletSchema = new mongoose.Schema<IWallet>({
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['bitcoin', 'monero'],
    },
    remoteName: {
        type: String,
        required: true,
    },
    addresses: {
        type: [String],
        default: [],
    },
    balance: BigInt,
    untrustedBalance: Number,
    blockHeight: Number,
    isLoaded: Boolean,
    isLocked: Boolean,
    isDirty: Boolean,
});

const Wallet = mongoose.model('Wallet', walletSchema);
export type WalletDoc = HydratedDocument<IWallet>;

export default Wallet;
