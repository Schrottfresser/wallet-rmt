import mongoose, { Types } from "mongoose";

export interface IWallet {
    name: string;
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
});

const Wallet = mongoose.model("Wallet", walletSchema);

export default Wallet;
