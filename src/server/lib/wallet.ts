import BadRequestError from "@server/errors/badRequestError.js";
import InternalServerError from "@server/errors/internalServerError.js";
import NotFoundError from "@server/errors/notFoundError.js";
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
 * @returns the found wallet
 * @throwsError {@link NotFoundError} if the specified wallet was not found
 */
export const retrieveWallet = async (walletId: mongoose.Types.ObjectId) => {
    const wallet = await Wallet.findById(walletId).populate<{
        remote: IRemote;
    }>("remote");
    if (!wallet) {
        throw new NotFoundError("Wallet not found");
    }

    return wallet;
};

/**
 * Creates or adds a new wallet with the given name
 * @param newWallet the new wallet
 * @returns the created/added wallet
 * @throwsError {@link BadRequestError} if the specified remote was not found
 * @throwsError {@link BadRequestError} if a wallet with this remoteName already exists at the specified remote
 */
export const createWallet = async (newWallet: IWallet) => {
    const remote = await Remote.findById(newWallet.remote);
    if (!remote) {
        throw new NotFoundError("Remote not found");
    }

    const existingWallet = await Wallet.findOne({
        remote: newWallet.remote,
        remoteName: newWallet.remoteName,
    });
    if (existingWallet) {
        throw new BadRequestError(
            `The wallet ${newWallet.remoteName} already exists at remote ${newWallet.remote}`
        );
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
 * @throwsError {@link NotFoundError} if the specified wallet was not found
 * @throwsError {@link InternalServerError} if the deletion failed
 */
export const deleteWallet = async (walletId: mongoose.Types.ObjectId) => {
    const wallet = await Wallet.findById(walletId).populate<{
        remote: IRemote;
    }>("remote");
    if (!wallet) {
        throw new NotFoundError("Wallet not found");
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
        throw new InternalServerError(`Deletion of wallet ${walletId} failed`);
    }
};

/**
 * Refreshes the wallet with the given id
 * @param walletId id of the wallet to refresh
 * @returns the refreshed wallet
 * @throwsError {@link NotFoundError} if the specified wallet was not found
 */
export const refreshWallet = async (walletId: mongoose.Types.ObjectId) => {
    const wallet = await Wallet.findById(walletId).populate<{
        remote: IRemote;
    }>("remote");
    if (!wallet) {
        throw new NotFoundError("Wallet not found");
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
 * Loads the wallet with the given id
 * @param walletId id of the wallet to load
 * @returns the loaded wallet
 * @throwsError {@link NotFoundError} if the specified wallet was not found
 */
export const loadWallet = async (walletId: mongoose.Types.ObjectId) => {
    const wallet = await Wallet.findById(walletId).populate<{
        remote: IRemote;
    }>("remote");
    if (!wallet) {
        throw new NotFoundError("Wallet not found");
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
 * Unloads the wallet with the given id
 * @param walletId id of the wallet to unload
 * @returns the unloaded wallet
 * @throwsError {@link NotFoundError} if the specified wallet was not found
 */
export const unloadWallet = async (walletId: mongoose.Types.ObjectId) => {
    const wallet = await Wallet.findById(walletId).populate<{
        remote: IRemote;
    }>("remote");
    if (!wallet) {
        throw new NotFoundError("Wallet not found");
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

/**
 * Encrypts the wallet with the given id permanently
 * @param walletId id of the wallet to encrypt permanently
 * @param passphrase key to encrypt the wallet with
 * @returns the encrypted wallet
 * @throwsError {@link NotFoundError} if the specified wallet was not found
 */
export const encryptWallet = async (
    walletId: mongoose.Types.ObjectId,
    passphrase: string
) => {
    const wallet = await Wallet.findById(walletId).populate<{
        remote: IRemote;
    }>("remote");
    if (!wallet) {
        throw new NotFoundError("Wallet not found");
    }

    const bitcoinRpc = new BitcoinRPC(
        wallet.remote.url,
        wallet.remote.username,
        wallet.remote.password
    );

    await bitcoinRpc.encryptwallet(wallet.remoteName, passphrase);

    wallet.isLocked = true;
    await wallet.save();

    return wallet;
};

/**
 * Changes the passphrase of the wallet with the given id
 * @param walletId id of the wallet to change the passphrase of
 * @param oldPassphrase current key of the wallet
 * @param newPassphrase new key of the wallet to change the passphrase to
 * @throwsError {@link NotFoundError} if the specified wallet was not found
 */
export const changeWalletPassphrase = async (
    walletId: mongoose.Types.ObjectId,
    oldPassphrase: string,
    newPassphrase: string
) => {
    const wallet = await Wallet.findById(walletId).populate<{
        remote: IRemote;
    }>("remote");
    if (!wallet) {
        throw new NotFoundError("Wallet not found");
    }

    const bitcoinRpc = new BitcoinRPC(
        wallet.remote.url,
        wallet.remote.username,
        wallet.remote.password
    );

    await bitcoinRpc.walletpassphrasechange(
        wallet.remoteName,
        oldPassphrase,
        newPassphrase
    );
};

/**
 * Unlocks the wallet with the given id temporarily
 * @param walletId id of the wallet to unlock temporarily
 * @param passphrase key to decrypt the wallet with
 * @param timeout the timeout to temporarily unlock the wallet in
 * @returns the decrypted wallet
 * @throwsError {@link NotFoundError} if the specified wallet was not found
 */
export const unlockWallet = async (
    walletId: mongoose.Types.ObjectId,
    passphrase: string,
    timeout: number
) => {
    const wallet = await Wallet.findById(walletId).populate<{
        remote: IRemote;
    }>("remote");
    if (!wallet) {
        throw new NotFoundError("Wallet not found");
    }

    const bitcoinRpc = new BitcoinRPC(
        wallet.remote.url,
        wallet.remote.username,
        wallet.remote.password
    );

    await bitcoinRpc.walletpassphrase(wallet.remoteName, passphrase, timeout);

    wallet.isLocked = false;
    await wallet.save();

    return wallet;
};

/**
 * Locks the wallet with the given id
 * @param walletId id of the wallet to lock
 * @returns the locked wallet
 * @throwsError {@link NotFoundError} if the specified wallet was not found
 */
export const lockWallet = async (walletId: mongoose.Types.ObjectId) => {
    const wallet = await Wallet.findById(walletId).populate<{
        remote: IRemote;
    }>("remote");
    if (!wallet) {
        throw new NotFoundError("Wallet not found");
    }

    const bitcoinRpc = new BitcoinRPC(
        wallet.remote.url,
        wallet.remote.username,
        wallet.remote.password
    );

    await bitcoinRpc.walletlock(wallet.remoteName);

    wallet.isLocked = true;
    await wallet.save();

    return wallet;
};
