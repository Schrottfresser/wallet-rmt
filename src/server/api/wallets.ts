import { createValidatedHandler } from "@server/api/validation/index.js";
import {
    createWalletSchema,
    retrieveWalletSchema,
    deleteWalletSchema,
    refreshWalletSchema,
    loadWalletSchema,
    unloadWalletSchema,
    encryptWalletSchema,
    changeWalletPassphraseSchema,
    lockWalletSchema,
    unlockWalletSchema,
    generateNewWalletAddressSchema,
} from "@server/api/validation/wallets.js";
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
    generateNewWalletAddress,
} from "@server/lib/wallet.js";
import { Router } from "express";
import mongoose from "mongoose";

const walletsRouter = Router();

walletsRouter.get("/", async (_req, res) => {
    const allWallets = await retrieveAllWallets();

    res.status(200).json(allWallets);
});

walletsRouter.post(
    "/",
    createValidatedHandler(createWalletSchema, async (data, _req, res) => {
        const wallet = await createWallet(
            data.body.remote,
            data.body.name,
            data.body.remoteName
        );

        res.status(201).json(wallet);
    })
);

walletsRouter.get(
    "/:walletId",
    createValidatedHandler(retrieveWalletSchema, async (data, _req, res) => {
        if (!mongoose.Types.ObjectId.isValid(data.params.walletId)) {
            throw new NotFoundError("Wallet ID not valid");
        }

        const walletId = new mongoose.Types.ObjectId(data.params.walletId);
        const wallet = await retrieveWallet(walletId);

        res.status(200).json(wallet);
    })
);

walletsRouter.delete(
    "/:walletId",
    createValidatedHandler(deleteWalletSchema, async (data, _req, res) => {
        if (!mongoose.Types.ObjectId.isValid(data.params.walletId)) {
            throw new NotFoundError("Wallet ID not valid");
        }

        const walletId = new mongoose.Types.ObjectId(data.params.walletId);
        await deleteWallet(walletId);

        res.status(200).send();
    })
);

walletsRouter.get(
    "/:walletId/refresh",
    createValidatedHandler(refreshWalletSchema, async (data, _req, res) => {
        if (!mongoose.Types.ObjectId.isValid(data.params.walletId)) {
            throw new NotFoundError("Wallet ID not valid");
        }

        const walletId = new mongoose.Types.ObjectId(data.params.walletId);
        const wallet = await refreshWallet(walletId);

        res.status(200).json(wallet);
    })
);

walletsRouter.get(
    "/:walletId/load",
    createValidatedHandler(loadWalletSchema, async (data, _req, res) => {
        if (!mongoose.Types.ObjectId.isValid(data.params.walletId)) {
            throw new NotFoundError("Wallet ID not valid");
        }

        const walletId = new mongoose.Types.ObjectId(data.params.walletId);
        const wallet = await loadWallet(walletId);

        res.status(200).json(wallet);
    })
);

walletsRouter.get(
    "/:walletId/unload",
    createValidatedHandler(unloadWalletSchema, async (data, _req, res) => {
        if (!mongoose.Types.ObjectId.isValid(data.params.walletId)) {
            throw new NotFoundError("Wallet ID not valid");
        }

        const walletId = new mongoose.Types.ObjectId(data.params.walletId);
        const wallet = await unloadWallet(walletId);

        res.status(200).json(wallet);
    })
);

walletsRouter.post(
    "/:walletId/encrypt",
    createValidatedHandler(encryptWalletSchema, async (data, _req, res) => {
        if (!mongoose.Types.ObjectId.isValid(data.params.walletId)) {
            throw new NotFoundError("Wallet ID not valid");
        }

        const walletId = new mongoose.Types.ObjectId(data.params.walletId);
        const wallet = await encryptWallet(walletId, data.body.passphrase);

        res.status(200).json(wallet);
    })
);

walletsRouter.post(
    "/:walletId/passphrase",
    createValidatedHandler(
        changeWalletPassphraseSchema,
        async (data, _req, res) => {
            if (!mongoose.Types.ObjectId.isValid(data.params.walletId)) {
                throw new NotFoundError("Wallet ID not valid");
            }

            const walletId = new mongoose.Types.ObjectId(data.params.walletId);
            await changeWalletPassphrase(
                walletId,
                data.body.oldPassphrase,
                data.body.newPassphrase
            );

            res.status(200).send();
        }
    )
);

walletsRouter.get(
    "/:walletId/lock",
    createValidatedHandler(lockWalletSchema, async (data, _req, res) => {
        if (!mongoose.Types.ObjectId.isValid(data.params.walletId)) {
            throw new NotFoundError("Wallet ID not valid");
        }

        const walletId = new mongoose.Types.ObjectId(data.params.walletId);
        const wallet = await lockWallet(walletId);

        res.status(200).json(wallet);
    })
);

walletsRouter.post(
    "/:walletId/unlock",
    createValidatedHandler(unlockWalletSchema, async (data, _req, res) => {
        if (!mongoose.Types.ObjectId.isValid(data.params.walletId)) {
            throw new NotFoundError("Wallet ID not valid");
        }

        const walletId = new mongoose.Types.ObjectId(data.params.walletId);
        const wallet = await unlockWallet(
            walletId,
            data.body.passphrase,
            data.body.timeout
        );

        res.status(200).json(wallet);
    })
);

walletsRouter.get(
    "/:walletId/address",
    createValidatedHandler(
        generateNewWalletAddressSchema,
        async (data, _req, res) => {
            const newAddress = await generateNewWalletAddress(
                data.params.walletId
            );

            res.status(200).send(newAddress);
        }
    )
);

export default walletsRouter;
