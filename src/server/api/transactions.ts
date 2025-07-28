import { createValidatedHandler } from "@server/api/validation/index.js";
import {
    listTransactionsSchema,
    sendTransactionSchema,
} from "@server/api/validation/transactions.js";
import {
    listWalletTransactions,
    sendTransaction,
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

transactionsRouter.get("/:txid", async (req, res) => {});

export default transactionsRouter;
