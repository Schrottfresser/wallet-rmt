import InternalServerError from "@server/errors/internalServerError.js";
import NotFoundError from "@server/errors/notFoundError.js";
import Remote, { IRemote } from "@server/model/remote.js";
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
 * Creates a new remote with the given name
 * @param name name of the new remote
 * @returns the created remote
 */
export const createRemote = async (newRemote: IRemote) => {
    const remote = await Remote.create(newRemote);

    return remote;
};

/**
 * Takes a remote id and returns the corresponding remote
 * @param remoteId id of the remote to search for
 * @returns the found remote
 * @throwsError {@link NotFoundError} if the specified remote was not found
 */
export const retrieveRemote = async (remoteId: mongoose.Types.ObjectId) => {
    const remote = await Remote.findById(remoteId);
    if (!remote) {
        throw new NotFoundError("Remote not found");
    }

    return remote;
};

/**
 * Creates a new remote with the given name
 * @param name name of the new remote
 * @returns the created remote
 */
export const editRemote = async (
    remoteId: mongoose.Types.ObjectId,
    newRemote: IRemote
) => {
    const remote = await Remote.findById(remoteId);
    if (!remote) {
        throw new NotFoundError("Remote not found");
    }

    remote.url = newRemote.url;
    remote.username = newRemote.username;
    remote.password = newRemote.password;

    await remote.save();
    return remote;
};

/**
 * Deletes a remote by the given id
 * @param remoteId id of the remote to delete
 * @throwsError {@link NotFoundError} if the specified remote was not found
 * @throwsError {@link InternalServerError} if the deletion failed
 */
export const deleteRemote = async (remoteId: mongoose.Types.ObjectId) => {
    const remote = await Remote.findById(remoteId);
    if (!remote) {
        throw new NotFoundError("Remote not found");
    }

    const deleteResult = await remote.deleteOne();
    if (!deleteResult.acknowledged || deleteResult.deletedCount < 1) {
        throw new InternalServerError(`Deletion of remote ${remoteId} failed`);
    }

    return true;
};
