import { createValidatedHandler } from "@server/route/validation/index.js";
import {
    createWalletSchema,
    retrieveWalletSchema,
    openWalletSchema,
    closeWalletSchema,
    changeWalletPasswordSchema,
    createWalletAddressSchema,
} from "@server/route/validation/wallets.js";
import BadRequestError from "@server/error/badRequestError.js";
import walletRepository from "@server/repository/wallet.js";
import Wallet from "@server/model/wallet.js";
import { Router } from "express";

const walletsRouter = Router();

walletsRouter.get("/", async (_req, res) => {
    const allWallets = await Wallet.find();

    res.status(200).json(allWallets);
});

walletsRouter.post(
    "/",
    createValidatedHandler(createWalletSchema, async (data, _req, res) => {
        const walletController = await walletRepository.create({
            name: data.body.name,
            remote: data.body.remote,
            remoteName: data.body.remoteName,
            addresses: [],
        });
        if (!walletController) {
            throw new BadRequestError("Remote does not exist");
        }

        const wallet = Wallet.findById(walletController.getWalletId());

        res.status(201).json(wallet);
    })
);

walletsRouter.get(
    "/:walletId",
    createValidatedHandler(retrieveWalletSchema, async (data, _req, res) => {
        const wallet = await Wallet.findById(data.params.walletId);

        res.status(200).json(wallet);
    })
);

/*walletsRouter.delete(
    "/:walletId",
    createValidatedHandler(deleteWalletSchema, async (data, _req, res) => {
        await deleteWallet(data.params.walletId);

        res.status(200).send();
    })
);*/

/*walletsRouter.get(
    "/:walletId/refresh",
    createValidatedHandler(refreshWalletSchema, async (data, _req, res) => {
        const wallet = await refreshWallet(data.params.walletId);

        res.status(200).json(wallet);
    })
);*/

walletsRouter.post(
    "/:walletId/open",
    createValidatedHandler(openWalletSchema, async (data, _req, res) => {
        const walletController = await walletRepository.findById(
            data.params.walletId
        );
        if (!walletController) {
            throw new BadRequestError("Wallet does not exist");
        }

        await walletController.open(data.body?.password);

        res.status(200).send();
    })
);

walletsRouter.get(
    "/:walletId/close",
    createValidatedHandler(closeWalletSchema, async (data, _req, res) => {
        const walletController = await walletRepository.findById(
            data.params.walletId
        );
        if (!walletController) {
            throw new BadRequestError("Wallet does not exist");
        }

        await walletController.close();

        res.status(200).send();
    })
);

walletsRouter.post(
    "/:walletId/password",
    createValidatedHandler(
        changeWalletPasswordSchema,
        async (data, _req, res) => {
            const walletController = await walletRepository.findById(
                data.params.walletId
            );
            if (!walletController) {
                throw new BadRequestError("Wallet does not exist");
            }

            await walletController.changePassword(
                data.body.newPassword,
                data.body.oldPassword
            );

            res.status(200).send();
        }
    )
);

walletsRouter.get(
    "/:walletId/address",
    createValidatedHandler(
        createWalletAddressSchema,
        async (data, _req, res) => {
            const walletController = await walletRepository.findById(
                data.params.walletId
            );
            if (!walletController) {
                throw new BadRequestError("Wallet does not exist");
            }

            const newAddress = await walletController.createAddress();

            res.status(200).send(newAddress);
        }
    )
);

export default walletsRouter;
