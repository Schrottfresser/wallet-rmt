import BitcoinRPC from "@server/external/bitcoinRpc.js";
import Remote, { IRemote } from "@server/model/remote.js";
import Wallet, { IWallet } from "@server/model/wallet.js";
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
    const wallet = await Wallet.findById(walletId).populate<{
        remote: IRemote;
    }>("remote");
    if (!wallet) {
        return undefined;
    }

    return wallet;
};

/**
 * Creates or adds a new wallet with the given name
 * @param name name of the new wallet
 * @returns the created/added wallet, the already existing wallet without loading it or undefined if remote does not exist
 */
export const createWallet = async (newWallet: IWallet) => {
    const remote = await Remote.findById(newWallet.remote);
    if (!remote) {
        return undefined;
    }

    const existingWallet = await Wallet.findOne({
        remoteName: newWallet.remoteName,
    });
    if (existingWallet) {
        return existingWallet;
    }

    const bitcoinRpc = new BitcoinRPC(
        remote.url,
        remote.username,
        remote.password
    );

    const allWallets = await bitcoinRpc.listwalletdir();
    if (allWallets.find((wallet) => wallet.name === newWallet.remoteName)) {
        await bitcoinRpc.loadwallet(newWallet.remoteName);
    } else {
        await bitcoinRpc.createwallet(newWallet.remoteName);
    }

    newWallet.isLoaded = true;
    const wallet = await Wallet.create(newWallet);

    return wallet;
};

/**
 * Deletes a wallet by the given id
 * @param walletId id of the wallet to delete
 * @returns `true` if the given wallet was found and deleted and `false` if not
 */
export const deleteWallet = async (walletId: mongoose.Types.ObjectId) => {
    const wallet = await Wallet.findById(walletId).populate<{
        remote: IRemote;
    }>("remote");
    if (!wallet) {
        return false;
    }

    if (wallet.isLoaded) {
        const bitcoinRpc = new BitcoinRPC(
            wallet.remote.url,
            wallet.remote.username,
            wallet.remote.password
        );

        bitcoinRpc.unloadwallet(wallet.remoteName);
    }

    const deleteResult = await wallet.deleteOne();
    if (!deleteResult.acknowledged || deleteResult.deletedCount < 1) {
        throw new Error(`Deletion of wallet ${walletId} failed`);
    }

    return true;
};

/**
 * Takes a wallet id and refreshes the corresponding wallet
 * @param walletId id of the wallet to refresh
 * @returns the refreshed wallet or undefined if not found
 */
export const refreshWallet = async (walletId: mongoose.Types.ObjectId) => {
    const wallet = await Wallet.findById(walletId).populate<{
        remote: IRemote;
    }>("remote");
    if (!wallet) {
        return undefined;
    }

    const bitcoinRpc = new BitcoinRPC(
        wallet.remote.url,
        wallet.remote.username,
        wallet.remote.password
    );

    wallet.balance = await bitcoinRpc.getbalance(wallet.remoteName);
    await wallet.save();

    return wallet;
};

/**
 * Takes a wallet id and refreshes the corresponding wallet
 * @param walletId id of the wallet to refresh
 * @returns the refreshed wallet or undefined if not found
 */
export const loadWallet = async (walletId: mongoose.Types.ObjectId) => {
    const wallet = await Wallet.findById(walletId).populate<{
        remote: IRemote;
    }>("remote");
    if (!wallet) {
        return undefined;
    }

    if (!wallet.isLoaded) {
        const bitcoinRpc = new BitcoinRPC(
            wallet.remote.url,
            wallet.remote.username,
            wallet.remote.password
        );

        await bitcoinRpc.loadwallet(wallet.remoteName);

        wallet.isLoaded = true;
        await wallet.save();
    }

    return wallet;
};

/**
 * Takes a wallet id and refreshes the corresponding wallet
 * @param walletId id of the wallet to refresh
 * @returns the refreshed wallet or undefined if not found
 */
export const unloadWallet = async (walletId: mongoose.Types.ObjectId) => {
    const wallet = await Wallet.findById(walletId).populate<{
        remote: IRemote;
    }>("remote");
    if (!wallet) {
        return undefined;
    }

    if (wallet.isLoaded) {
        const bitcoinRpc = new BitcoinRPC(
            wallet.remote.url,
            wallet.remote.username,
            wallet.remote.password
        );

        await bitcoinRpc.unloadwallet(wallet.remoteName);

        wallet.isLoaded = false;
        await wallet.save();
    }

    return wallet;
};
