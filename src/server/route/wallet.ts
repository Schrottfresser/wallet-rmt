import { validatedHandler } from '@server/route/validation/index.js';
import {
    createWalletSchema,
    retrieveWalletSchema,
    changeWalletPasswordSchema,
    createWalletAddressSchema,
    unlockWalletSchema,
} from '@server/route/validation/wallet.js';
import BadRequestError from '@server/error/badRequestError.js';
import walletRepository from '@server/repository/wallet.js';
import Wallet from '@server/model/mongoose/wallet.js';
import { Router } from 'express';
import { createWalletAuthToken, decryptWalletAuthToken } from '@server/util/crypto.js';
import { WALLET_AUTH_COOKIE } from '@server/constant/cookie.js';
import env from '@server/env.js';
import { useSession, useWalletPassword } from './hook/auth.js';
import InternalServerError from '@server/error/internalServerError.js';

const walletRouter = Router();

walletRouter.get('/', async (_req, res) => {
    const allWallets = await Wallet.find();

    res.status(200).json(allWallets);
});

walletRouter.post(
    '/',
    validatedHandler(createWalletSchema, async (data, req, res) => {
        const session = await useSession(req, true);

        const walletService = await walletRepository.create(
            {
                name: data.body.name,
                type: data.body.type,
                remoteName: data.body.remoteName,
                addresses: [],
            },
            session.username,
        );
        if (!walletService) {
            throw new BadRequestError('Wallet type does not exist');
        }

        const wallet = await Wallet.findById(walletService.getWalletId());
        if (!wallet) {
            throw new InternalServerError('Creating the wallet failed');
        }

        res.status(201).json(wallet);
    }),
);

walletRouter.get(
    '/:walletId',
    validatedHandler(retrieveWalletSchema, async (data, req, res) => {
        const session = await useSession(req, true);

        const walletService = await walletRepository.findById(data.params.walletId, session.username);
        const wallet = await Wallet.findById(data.params.walletId);
        if (!walletService || !wallet) {
            throw new BadRequestError('Wallet not found');
        }

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
    validatedHandler(unlockWalletSchema, async (data, req, res) => {
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
            maxAge: env.walletAuthExpirationMins * 60 * 1000, // minutes to millis
        });

        res.status(200).send();
    }),
);

walletRouter.post(
    '/:walletId/password',
    validatedHandler(changeWalletPasswordSchema, async (data, req, res) => {
        const session = await useSession(req, true);

        const walletService = await walletRepository.findById(data.params.walletId, session.username);
        if (!walletService) {
            throw new BadRequestError('Wallet not found');
        }

        await walletService.changePassword(data.body.newPassword, data.body.oldPassword);

        res.status(200).send();
    }),
);

walletRouter.get(
    '/:walletId/address',
    validatedHandler(createWalletAddressSchema, async (data, req, res) => {
        const session = await useSession(req, true);
        const walletPassword = await useWalletPassword(req, data.params.walletId);

        const walletService = await walletRepository.findById(data.params.walletId, session.username);
        if (!walletService) {
            throw new BadRequestError('Wallet not found');
        }

        const newAddress = await walletService.createAddress(walletPassword);

        res.status(200).send(newAddress);
    }),
);

export default walletRouter;
