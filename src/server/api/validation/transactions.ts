import { objectIdSchema } from "@server/api/validation/index.js";
import z from "zod";

export const listTransactionsSchema = z.object({
    query: z.object({
        walletId: objectIdSchema,
        count: z.coerce.number().int().positive().optional(),
        skip: z.coerce.number().int().positive().optional(),
    }),
});

export const sendTransactionSchema = z.object({
    body: z.object({
        address: z.string(),
        amount: z.number().positive(),
    }),

    query: z.object({
        walletId: objectIdSchema,
    }),
});

export const retrieveWalletTransactionSchema = z.object({
    params: z.object({
        txid: z.string(),
    }),

    query: z.object({
        walletId: objectIdSchema,
    }),
});

export const setTransactionFeeSchema = z.object({
    body: z.object({
        fee: z.number().min(0),
    }),

    query: z.object({
        walletId: objectIdSchema,
    }),
});

export const abandonTransactionSchema = z.object({
    params: z.object({
        txid: z.string(),
    }),

    query: z.object({
        walletId: objectIdSchema,
    }),
});
