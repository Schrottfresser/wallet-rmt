import { createValidatedHandler } from "@server/api/validation/index.js";
import {
    listTransactionsSchema,
    sendTransactionSchema,
    retrieveWalletTransactionSchema,
    setTransactionFeeSchema,
    abandonTransactionSchema,
} from "@server/api/validation/transactions.js";
import {
    listWalletTransactions,
    sendTransaction,
    retrieveWalletTransaction,
    setTransactionFee,
    abandonTransaction,
} from "@server/lib/transaction.js";
import { Router } from "express";

const transactionsRouter = Router();

transactionsRouter.get(
    "/",
    createValidatedHandler(listTransactionsSchema, async (data, _req, res) => {
        const transactions = await listWalletTransactions(
            data.query.walletId,
            data.query.count,
            data.query.skip
        );

        res.status(200).json(transactions);
    })
);

transactionsRouter.post(
    "/",
    createValidatedHandler(sendTransactionSchema, async (data, _req, res) => {
        await sendTransaction(
            data.query.walletId,
            data.body.address,
            data.body.amount
        );

        res.status(200).send();
    })
);

transactionsRouter.get(
    "/:txid",
    createValidatedHandler(
        retrieveWalletTransactionSchema,
        async (data, _req, res) => {
            const transaction = await retrieveWalletTransaction(
                data.query.walletId,
                data.params.txid
            );

            res.status(200).json(transaction);
        }
    )
);

transactionsRouter.post(
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
);

export default transactionsRouter;
