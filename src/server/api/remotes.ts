import {
    retrieveAllRemotes,
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

remotesRouter.post("/", async (req, res) => {
    const remote = await createRemote(req.body);

    res.status(201).json(remote);
});

remotesRouter.delete("/:remoteId", async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.remoteId)) {
        return next({ status: 404, message: "Remote ID not valid" });
    }

    const remoteId = new mongoose.Types.ObjectId(req.params.remoteId);
    const deleteResult = deleteRemote(remoteId);
    if (!deleteResult) {
        return next({ status: 404, message: "Remote not found" });
    }

    res.status(200).send();
});

export default remotesRouter;
