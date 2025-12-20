import mongoose from 'mongoose';

export type WalletType = 'bitcoin' | 'monero';

export interface IWallet {
    name: string;
    type: WalletType;
    remoteName: string;
    addresses: string[];
    balance?: number;
    untrustedBalance?: number;
    blockHeight?: number;
    isLoaded?: boolean;
    isLocked?: boolean;
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
        required: true,
    },
    balance: Number,
    untrustedBalance: Number,
    blockHeight: Number,
    isLoaded: Boolean,
    isLocked: Boolean,
});

export type WalletDoc = InstanceType<typeof Wallet>;

const Wallet = mongoose.model('Wallet', walletSchema);

export default Wallet;
