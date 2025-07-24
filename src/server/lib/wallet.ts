import Wallet from "@server/model/wallet.js";
import mongoose from "mongoose";

/**
 * Returns all existing wallets
 * @returns all existing wallets
 */
export const retrieveAllWallets = async () => {
    const allWallets = await Wallet.find();

    return allWallets;
};

/**
 * Takes a wallet id and returns the corresponding wallet
 * @param walletId id of the wallet to search for
 * @returns the found wallet or undefined if not found
 */
export const retrieveWallet = async (walletId: mongoose.Types.ObjectId) => {
    const wallet = await Wallet.findById(walletId);
    if (!wallet) {
        return undefined;
    }

    return wallet;
};

/**
 * Creates a new wallet with the given name
 * @param name name of the new wallet
 * @returns the created wallet
 */
export const createWallet = async (name: string) => {
    const wallet = await Wallet.create({ name: name });

    return wallet;
};

/**
 * Deletes a wallet by the given id
 * @param walletId id of the wallet to delete
 * @returns `true` if the given wallet was found and deleted and `false` if not
 */
export const deleteWallet = async (walletId: mongoose.Types.ObjectId) => {
    const wallet = await Wallet.findById(walletId);
    if (!wallet) {
        return false;
    }

    const deleteResult = await wallet.deleteOne();
    if (!deleteResult.acknowledged || deleteResult.deletedCount < 1) {
        throw new Error(`Deletion of wallet ${walletId} failed`);
    }

    return true;
};
