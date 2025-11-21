import { createValidatedHandler } from "@server/route/validation/index.js";
import {
    listTransferSchema,
    sendTransferSchema,
    retrieveWalletTransferSchema,
    setTransactionFeeSchema,
    abandonTransactionSchema,
} from "@server/route/validation/transactions.js";
import BadRequestError from "@server/error/badRequestError.js";
import walletRepository from "@server/repository/wallet.js";
import { Router } from "express";

const transactionsRouter = Router();

transactionsRouter.get(
    "/",
    createValidatedHandler(listTransferSchema, async (data, _req, res) => {
        const walletService = await walletRepository.findById(
            data.query.walletId
        );
        if (!walletService) {
            throw new BadRequestError("Wallet does not exist");
        }

        const transactions = await walletService.getAllTransfers();

        res.status(200).json(transactions);
    })
);

transactionsRouter.post(
    "/",
    createValidatedHandler(sendTransferSchema, async (data, _req, res) => {
        const walletService = await walletRepository.findById(
            data.query.walletId
        );
        if (!walletService) {
            throw new BadRequestError("Wallet does not exist");
        }

        const txid = await walletService.transfer(
            data.body.address,
            data.body.amount,
            data.body.estimateMode,
            data.body.substractFee
        );

        res.status(201).send(txid);
    })
);

transactionsRouter.get(
    "/:transferId",
    createValidatedHandler(
        retrieveWalletTransferSchema,
        async (data, _req, res) => {
            const walletService = await walletRepository.findById(
                data.query.walletId
            );
            if (!walletService) {
                throw new BadRequestError("Wallet does not exist");
            }

            const transfer = await walletService.getTransfer(
                data.params.transferId
            );

            res.status(200).json(transfer);
        }
    )
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

export default transactionsRouter;
