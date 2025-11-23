import { createValidatedHandler } from '@server/route/validation/index.js';
import {
    createWalletSchema,
    retrieveWalletSchema,
    openWalletSchema,
    closeWalletSchema,
    changeWalletPasswordSchema,
    createWalletAddressSchema,
    unlockWalletSchema,
} from '@server/route/validation/wallet.js';
import BadRequestError from '@server/error/badRequestError.js';
import walletRepository from '@server/repository/wallet.js';
import Wallet from '@server/model/wallet.js';
import { Router } from 'express';
import { createWalletAuthToken, decryptWalletAuthToken } from '@server/util/crypto.js';
import { WALLET_AUTH_COOKIE } from '@server/constant/cookie.js';
import env from '@server/env.js';

const walletRouter = Router();

walletRouter.get('/', async (_req, res) => {
    const allWallets = await Wallet.find();

    res.status(200).json(allWallets);
});

walletRouter.post(
    '/',
    createValidatedHandler(createWalletSchema, async (data, _req, res) => {
        const walletService = await walletRepository.create({
            name: data.body.name,
            remote: data.body.remote,
            remoteName: data.body.remoteName,
            addresses: [],
        });
        if (!walletService) {
            throw new BadRequestError('Remote does not exist');
        }

        const wallet = Wallet.findById(walletService.getWalletId());

        res.status(201).json(wallet);
    }),
);

walletRouter.get(
    '/:walletId',
    createValidatedHandler(retrieveWalletSchema, async (data, _req, res) => {
        const wallet = await Wallet.findById(data.params.walletId);

        res.status(200).json(wallet);
    }),
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

walletRouter.post(
    '/:walletId/unlock',
    createValidatedHandler(unlockWalletSchema, async (data, req, res) => {
        let passwords: {
            [walletId: string]: string;
        };

        try {
            const oldToken = req.cookies[WALLET_AUTH_COOKIE];
            passwords = (await decryptWalletAuthToken(oldToken)).passwords;
        } catch {
            passwords = {};
        }

        const walletId = data.params.walletId.toString();
        passwords[walletId] = data.body.password;

        const token = await createWalletAuthToken({
            passwords,
        });

        res.cookie(WALLET_AUTH_COOKIE, token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: Number(env.walletAuthExpirationMins) * 60 * 1000, // minutes to millis
        });

        res.status(200).send();
    }),
);

walletRouter.post(
    '/:walletId/open',
    createValidatedHandler(openWalletSchema, async (data, _req, res) => {
        const walletService = await walletRepository.findById(data.params.walletId);
        if (!walletService) {
            throw new BadRequestError('Wallet does not exist');
        }

        await walletService.open(data.body?.password);

        res.status(200).send();
    }),
);

walletRouter.get(
    '/:walletId/close',
    createValidatedHandler(closeWalletSchema, async (data, _req, res) => {
        const walletService = await walletRepository.findById(data.params.walletId);
        if (!walletService) {
            throw new BadRequestError('Wallet does not exist');
        }

        await walletService.close();

        res.status(200).send();
    }),
);

walletRouter.post(
    '/:walletId/password',
    createValidatedHandler(changeWalletPasswordSchema, async (data, _req, res) => {
        const walletService = await walletRepository.findById(data.params.walletId);
        if (!walletService) {
            throw new BadRequestError('Wallet does not exist');
        }

        await walletService.changePassword(data.body.newPassword, data.body.oldPassword);

        res.status(200).send();
    }),
);

walletRouter.get(
    '/:walletId/address',
    createValidatedHandler(createWalletAddressSchema, async (data, _req, res) => {
        const walletService = await walletRepository.findById(data.params.walletId);
        if (!walletService) {
            throw new BadRequestError('Wallet does not exist');
        }

        const newAddress = await walletService.createAddress();

        res.status(200).send(newAddress);
    }),
);

export default walletRouter;
