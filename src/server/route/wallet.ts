import { validatedHandler } from '@server/route/validation/index.js';
import {
    createWalletSchema,
    retrieveWalletSchema,
    changeWalletPasswordSchema,
    createWalletAddressSchema,
    openWalletSchema,
    closeWalletSchema,
} from '@server/route/validation/wallet.js';
import BadRequestError from '@server/error/badRequestError.js';
import walletRepository from '@server/repository/wallet.js';
import { Router } from 'express';
import { useSession } from '@server/route/hook/auth.js';
import logger from '@server/logger.js';
import { verifyAuthenticationResponse } from '@server/service/user.js';
import { base64URLStringToBuffer } from '@simplewebauthn/browser';
import { createWallet, retrieveWallets } from '@server/service/wallet/index.js';

const walletRouter = Router();

walletRouter.get('/', async (req, res) => {
    const session = await useSession(req, true);
    logger.info(`API - Retrieve wallets of user "${session.username}"`);

    const wallets = await retrieveWallets(session.username);

    res.status(200).json(wallets);
});

walletRouter.post(
    '/',
    validatedHandler(createWalletSchema, async (data, req, res) => {
        const session = await useSession(req, true);
        logger.info(`API - Create wallet "${data.body.name}" for user "${session.username}"`);

        await verifyAuthenticationResponse(session.username, data.body.attestationResponse, 'auth-existing');
        const credentialId = data.body.attestationResponse.id;
        const prf = data.body.attestationResponse.clientExtensionResults.prf?.results?.first;
        if (!prf) {
            throw new BadRequestError('PRF required');
        }
        const prfBuffer = Buffer.from(base64URLStringToBuffer(prf));

        await createWallet(data.body.name, data.body.type, session.username, credentialId, prfBuffer);

        const wallets = await retrieveWallets(session.username);
        res.status(201).json(wallets);
    }),
);

walletRouter.get(
    '/:walletId',
    validatedHandler(retrieveWalletSchema, async (data, req, res) => {
        const session = await useSession(req, true);
        logger.info(`API - Refresh wallet "${data.params.walletId}" of user "${session.username}"`);

        const walletService = await walletRepository.findById(data.params.walletId, session.username);
        if (!walletService) {
            throw new BadRequestError('Wallet not found');
        }

        const wallet = walletService.getWallet();
        const balance = await walletService.getBalance();
        wallet.balance = balance.unlockedBalance;
        await wallet.save();

        const wallets = await retrieveWallets(session.username);
        res.status(200).json(wallets);
    }),
);

/*walletsRouter.delete(
    "/:walletId",
    createValidatedHandler(deleteWalletSchema, async (data, _req, res) => {
        await deleteWallet(data.params.walletId);

        res.status(200).send();
    })
);*/

walletRouter.post(
    '/:walletId/open',
    validatedHandler(openWalletSchema, async (data, req, res) => {
        const session = await useSession(req, true);
        logger.info(`API - Open wallet "${data.params.walletId}"`);

        const walletService = await walletRepository.findById(data.params.walletId, session.username);
        if (!walletService) {
            throw new BadRequestError('Wallet not found');
        }

        await walletService.open(data.body.password);

        const wallets = await retrieveWallets(session.username);
        res.status(200).json(wallets);
    }),
);

walletRouter.get(
    '/:walletId/close',
    validatedHandler(closeWalletSchema, async (data, req, res) => {
        const session = await useSession(req, true);
        logger.info(`API - Close wallet "${data.params.walletId}"`);

        const walletService = await walletRepository.findById(data.params.walletId, session.username);
        if (!walletService) {
            throw new BadRequestError('Wallet not found');
        }

        await walletService.close();

        const wallets = await retrieveWallets(session.username);
        res.status(200).json(wallets);
    }),
);

walletRouter.post(
    '/:walletId/password',
    validatedHandler(changeWalletPasswordSchema, async (data, req, res) => {
        const session = await useSession(req, true);
        logger.info(`API - Change password of wallet "${data.params.walletId}" of user "${session.username}"`);

        const walletService = await walletRepository.findById(data.params.walletId, session.username);
        if (!walletService) {
            throw new BadRequestError('Wallet not found');
        }

        await walletService.changePassword(data.body.newPassword, data.body.oldPassword);

        const wallets = await retrieveWallets(session.username);
        res.status(200).json(wallets);
    }),
);

walletRouter.get(
    '/:walletId/address',
    validatedHandler(createWalletAddressSchema, async (data, req, res) => {
        const session = await useSession(req, true);
        logger.info(`API - Create address for wallet "${data.params.walletId}" of user "${session.username}"`);

        const walletService = await walletRepository.findById(data.params.walletId, session.username);
        if (!walletService) {
            throw new BadRequestError('Wallet not found');
        }

        await walletService.createAddress();

        const wallets = await retrieveWallets(session.username);
        res.status(200).send(wallets);
    }),
);

export default walletRouter;
