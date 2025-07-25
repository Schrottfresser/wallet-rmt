import Remote, { IRemote } from "@server/model/remote.js";
import Wallet, { IWallet } from "@server/model/wallet.js";
import mongoose from "mongoose";

/**
 * Returns all existing remotes
 * @returns all existing remotes
 */
export const retrieveAllRemotes = async () => {
    const allRemotes = await Remote.find();

    return allRemotes;
};

/**
 * Takes a remote id and returns the corresponding wallet
 * @param remoteId id of the wallet to search for
 * @returns the found remote or undefined if not found
 */
export const retrieveRemote = async (remoteId: mongoose.Types.ObjectId) => {
    const remote = await Remote.findById(remoteId);
    if (!remote) {
        return undefined;
    }

    return remote;
};

/**
 * Creates a new remote with the given name
 * @param name name of the new remote
 * @returns the created remote
 */
export const createRemote = async (newRemote: IRemote) => {
    const remote = await Remote.create(newRemote);

    return remote;
};

/**
 * Deletes a remote by the given id
 * @param remoteId id of the remote to delete
 * @returns `true` if the given remote was found and deleted and `false` if not
 */
export const deleteRemote = async (remoteId: mongoose.Types.ObjectId) => {
    const remote = await Remote.findById(remoteId);
    if (!remote) {
        return false;
    }

    const deleteResult = await remote.deleteOne();
    if (!deleteResult.acknowledged || deleteResult.deletedCount < 1) {
        throw new Error(`Deletion of remote ${remoteId} failed`);
    }

    return true;
};
