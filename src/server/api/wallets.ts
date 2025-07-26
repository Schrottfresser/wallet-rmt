import NotFoundError from "@server/errors/notFoundError.js";
import {
    retrieveAllWallets,
    retrieveWallet,
    createWallet,
    deleteWallet,
    refreshWallet,
    loadWallet,
    unloadWallet,
    encryptWallet,
    changeWalletPassphrase,
    lockWallet,
    unlockWallet,
} from "@server/lib/wallet.js";
import { Router } from "express";
import mongoose from "mongoose";

const walletsRouter = Router();

walletsRouter.get("/", async (_req, res) => {
    const allWallets = await retrieveAllWallets();

    res.status(200).json(allWallets);
});

walletsRouter.get("/:walletId", async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.walletId)) {
        throw new NotFoundError("Wallet ID not valid");
    }

    const walletId = new mongoose.Types.ObjectId(req.params.walletId);
    const wallet = await retrieveWallet(walletId);

    res.status(200).json(wallet);
});

walletsRouter.post("/", async (req, res) => {
    const wallet = await createWallet(req.body);

    res.status(201).json(wallet);
});

walletsRouter.delete("/:walletId", async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.walletId)) {
        throw new NotFoundError("Wallet ID not valid");
    }

    const walletId = new mongoose.Types.ObjectId(req.params.walletId);
    await deleteWallet(walletId);

    res.status(200).send();
});

walletsRouter.get("/:walletId/refresh", async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.walletId)) {
        throw new NotFoundError("Wallet ID not valid");
    }

    const walletId = new mongoose.Types.ObjectId(req.params.walletId);
    const wallet = await refreshWallet(walletId);

    res.status(200).json(wallet);
});

walletsRouter.get("/:walletId/load", async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.walletId)) {
        throw new NotFoundError("Wallet ID not valid");
    }

    const walletId = new mongoose.Types.ObjectId(req.params.walletId);
    const wallet = await loadWallet(walletId);

    res.status(200).json(wallet);
});

walletsRouter.get("/:walletId/unload", async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.walletId)) {
        throw new NotFoundError("Wallet ID not valid");
    }

    const walletId = new mongoose.Types.ObjectId(req.params.walletId);
    const wallet = await unloadWallet(walletId);

    res.status(200).json(wallet);
});

walletsRouter.post("/:walletId/encrypt", async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.walletId)) {
        throw new NotFoundError("Wallet ID not valid");
    }

    const walletId = new mongoose.Types.ObjectId(req.params.walletId);
    const wallet = await encryptWallet(walletId, req.body.passphrase);

    res.status(200).json(wallet);
});

walletsRouter.post("/:walletId/passphrase", async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.walletId)) {
        throw new NotFoundError("Wallet ID not valid");
    }

    const walletId = new mongoose.Types.ObjectId(req.params.walletId);
    const wallet = await changeWalletPassphrase(
        walletId,
        req.body.oldPassphrase,
        req.body.newPassphrase
    );

    res.status(200).json(wallet);
});

walletsRouter.get("/:walletId/lock", async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.walletId)) {
        throw new NotFoundError("Wallet ID not valid");
    }

    const walletId = new mongoose.Types.ObjectId(req.params.walletId);
    const wallet = await lockWallet(walletId);

    res.status(200).json(wallet);
});

walletsRouter.post("/:walletId/unlock", async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.walletId)) {
        throw new NotFoundError("Wallet ID not valid");
    }

    const walletId = new mongoose.Types.ObjectId(req.params.walletId);
    const wallet = await unlockWallet(
        walletId,
        req.body.passphrase,
        req.body.timeout
    );

    res.status(200).json(wallet);
});

export default walletsRouter;
