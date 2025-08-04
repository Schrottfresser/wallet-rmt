import mongoose from "mongoose";

export interface IWallet {
    name: string;
    remote: mongoose.Types.ObjectId;
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
    remote: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Remote",
        required: true,
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

const Wallet = mongoose.model("Wallet", walletSchema);

export default Wallet;
