import { createValidatedHandler } from "@server/api/validation/index.js";
import {
    createRemoteSchema,
    retrieveRemoteSchema,
    deleteRemoteSchema,
} from "@server/api/validation/remotes.js";
import NotFoundError from "@server/errors/notFoundError.js";
import {
    retrieveAllRemotes,
    createRemote,
    retrieveRemote,
    deleteRemote,
} from "@server/lib/remote.js";
import { Router } from "express";
import mongoose from "mongoose";

const remotesRouter = Router();

remotesRouter.get("/", async (_req, res) => {
    const allRemotes = await retrieveAllRemotes();

    res.status(200).json(allRemotes);
});

remotesRouter.post(
    "/",
    createValidatedHandler(createRemoteSchema, async (data, _req, res) => {
        const remote = await createRemote(data.body);

        res.status(201).json(remote);
    })
);

remotesRouter.get(
    "/:remoteId",
    createValidatedHandler(retrieveRemoteSchema, async (data, _req, res) => {
        if (!mongoose.Types.ObjectId.isValid(data.params.remoteId)) {
            throw new NotFoundError("Remote ID not valid");
        }

        const remoteId = new mongoose.Types.ObjectId(data.params.remoteId);
        const remote = await retrieveRemote(remoteId);

        res.status(200).json(remote);
    })
);

remotesRouter.delete(
    "/:remoteId",
    createValidatedHandler(deleteRemoteSchema, async (data, _req, res) => {
        if (!mongoose.Types.ObjectId.isValid(data.params.remoteId)) {
            throw new NotFoundError("Remote ID not valid");
        }

        const remoteId = new mongoose.Types.ObjectId(data.params.remoteId);
        deleteRemote(remoteId);

        res.status(200).send();
    })
);

export default remotesRouter;
