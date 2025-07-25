import {
    retrieveAllWallets,
    retrieveWallet,
    createWallet,
    deleteWallet,
    refreshWallet,
    loadWallet,
    unloadWallet,
} from "@server/lib/wallet.js";
import { Router } from "express";
import mongoose from "mongoose";

const walletsRouter = Router();

walletsRouter.get("/", async (_req, res) => {
    const allWallets = await retrieveAllWallets();

    res.status(200).json(allWallets);
});

walletsRouter.get("/:walletId", async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.walletId)) {
        return next({ status: 404, message: "Wallet ID not valid" });
    }

    const walletId = new mongoose.Types.ObjectId(req.params.walletId);
    const wallet = await retrieveWallet(walletId);
    if (!wallet) {
        return next({ status: 404, message: "Wallet not found" });
    }

    res.status(200).json(wallet);
});

walletsRouter.post("/", async (req, res) => {
    const wallet = await createWallet(req.body);

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

walletsRouter.get("/:walletId/refresh", async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.walletId)) {
        return next({ status: 404, message: "Wallet ID not valid" });
    }

    const walletId = new mongoose.Types.ObjectId(req.params.walletId);
    const wallet = await refreshWallet(walletId);
    if (!wallet) {
        return next({ status: 404, message: "Wallet not found" });
    }

    res.status(200).json(wallet);
});

walletsRouter.get("/:walletId/load", async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.walletId)) {
        return next({ status: 404, message: "Wallet ID not valid" });
    }

    const walletId = new mongoose.Types.ObjectId(req.params.walletId);
    const wallet = await loadWallet(walletId);
    if (!wallet) {
        return next({ status: 404, message: "Wallet not found" });
    }

    res.status(200).json(wallet);
});

walletsRouter.get("/:walletId/unload", async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.walletId)) {
        return next({ status: 404, message: "Wallet ID not valid" });
    }

    const walletId = new mongoose.Types.ObjectId(req.params.walletId);
    const wallet = await unloadWallet(walletId);
    if (!wallet) {
        return next({ status: 404, message: "Wallet not found" });
    }

    res.status(200).json(wallet);
});

export default walletsRouter;
