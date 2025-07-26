import NotFoundError from "@server/errors/notFoundError.js";
import {
    retrieveAllRemotes,
    retrieveRemote,
    createRemote,
    deleteRemote,
} from "@server/lib/remote.js";
import { Router } from "express";
import mongoose from "mongoose";

const remotesRouter = Router();

remotesRouter.get("/", async (_req, res) => {
    const allRemotes = await retrieveAllRemotes();

    res.status(200).json(allRemotes);
});

remotesRouter.get("/:remoteId", async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.remoteId)) {
        throw new NotFoundError("Remote ID not valid");
    }

    const remoteId = new mongoose.Types.ObjectId(req.params.remoteId);
    const remote = await retrieveRemote(remoteId);

    res.status(200).json(remote);
});

remotesRouter.post("/", async (req, res) => {
    const remote = await createRemote(req.body);

    res.status(201).json(remote);
});

remotesRouter.delete("/:remoteId", async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.remoteId)) {
        throw new NotFoundError("Remote ID not valid");
    }

    const remoteId = new mongoose.Types.ObjectId(req.params.remoteId);
    deleteRemote(remoteId);

    res.status(200).send();
});

export default remotesRouter;
