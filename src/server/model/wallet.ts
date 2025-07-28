import mongoose, { Types } from "mongoose";

export interface IWallet {
    name: string;
    remote: Types.ObjectId;
    remoteName: string;
    balance?: number;
    untrustedBalance?: number;
    blockHeight?: number;
    isLoaded?: boolean;
    isLocked?: boolean;
}

export interface IWalletWithMeta extends IWallet {
    _id: Types.ObjectId;
    __v: number;
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
    balance: Number,
    untrustedBalance: Number,
    blockHeight: Number,
    isLoaded: Boolean,
    isLocked: Boolean,
});

const Wallet = mongoose.model("Wallet", walletSchema);

export default Wallet;
