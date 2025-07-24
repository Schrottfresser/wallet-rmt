import {
    createWallet,
    deleteWallet,
    retrieveAllWallets,
} from "@server/lib/wallet.js";
import Wallet from "@server/model/wallet.js";
import { Router } from "express";
import mongoose from "mongoose";

const walletsRouter = Router();

walletsRouter.get("/", async (_req, res) => {
    const allWallets = await retrieveAllWallets();

    res.status(200).json(allWallets);
});

walletsRouter.post("/", async (req, res) => {
    const wallet = await createWallet(req.body.name);

    res.status(201).json(wallet);
});

walletsRouter.delete("/:walletId", async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.walletId)) {
        return next({ status: 404, message: "Wallet ID not valid" });
    }

    const walletId = new mongoose.Types.ObjectId(req.params.walletId);
    const deleteResult = deleteWallet(walletId);
    if (!deleteResult) {
        return next({ status: 404, message: "Wallet not found" });
    }

    res.status(200).send();
});

export default walletsRouter;
