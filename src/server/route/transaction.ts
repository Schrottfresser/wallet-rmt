import { validatedHandler } from '@server/route/validation/index.js';
import {
    listTransferSchema,
    sendTransferSchema,
    retrieveWalletTransferSchema,
} from '@server/route/validation/transaction.js';
import BadRequestError from '@server/error/badRequestError.js';
import walletRepository from '@server/repository/wallet.js';
import { Router } from 'express';
import { useSession } from './hook/auth.js';
import logger from '@server/logger.js';

const transactionRouter = Router();

transactionRouter.get(
    '/',
    validatedHandler(listTransferSchema, async (data, req, res) => {
        const session = await useSession(req, true);
        logger.info(`API - List transfers of wallet "${data.query.walletId}" of user "${session.username}"`);

        const walletService = await walletRepository.findById(data.query.walletId, session.username);
        if (!walletService) {
            throw new BadRequestError('Wallet does not exist');
        }

        const transactions = await walletService.getAllTransfers();

        res.status(200).json(transactions);
    }),
);

transactionRouter.post(
    '/',
    validatedHandler(sendTransferSchema, async (data, req, res) => {
        const session = await useSession(req, true);
        logger.info(`API - Send transfer from wallet "${data.query.walletId}" of user "${session.username}"`);

        const walletService = await walletRepository.findById(data.query.walletId, session.username);
        if (!walletService) {
            throw new BadRequestError('Wallet does not exist');
        }

        const txid = await walletService.transfer(
            data.body.address,
            data.body.amount,
            data.body.estimateMode,
            data.body.substractFee,
        );

        res.status(201).send(txid);
    }),
);

transactionRouter.get(
    '/:transferId',
    validatedHandler(retrieveWalletTransferSchema, async (data, req, res) => {
        const session = await useSession(req, true);
        logger.info(
            `API - Retrieve transfer "${data.params.transferId}" of wallet "${data.query.walletId}" of user "${session.username}"`,
        );

        const walletService = await walletRepository.findById(data.query.walletId, session.username);
        if (!walletService) {
            throw new BadRequestError('Wallet does not exist');
        }

        const transfer = await walletService.getTransfer(data.params.transferId);

        res.status(200).json(transfer);
    }),
);

/*transactionsRouter.post(
    "/fee",
    createValidatedHandler(setTransactionFeeSchema, async (data, _req, res) => {
        await setTransactionFee(data.query.walletId, data.body.fee);

        res.status(200).send();
    })
);

transactionsRouter.get(
    "/:txid/abandon",
    createValidatedHandler(
        abandonTransactionSchema,
        async (data, _req, res) => {
            await abandonTransaction(data.query.walletId, data.params.txid);

            res.status(200).send();
        }
    )
);*/

export default transactionRouter;
