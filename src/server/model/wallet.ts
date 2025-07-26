import mongoose, { Types } from "mongoose";

export interface IWallet {
    name: string;
    remote: Types.ObjectId;
    remoteName: string;
    balance?: number;
    isLoaded?: boolean;
    isEncrypted?: boolean;
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
        unique: true,
    },
    balance: Number,
    isLoaded: Boolean,
    isEncrypted: Boolean,
});

const Wallet = mongoose.model("Wallet", walletSchema);

export default Wallet;
