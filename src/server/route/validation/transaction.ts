import { objectIdSchema } from '@server/route/validation/index.js';
import { authenticateResponseSchema } from '@server/route/validation/webAuthn.js';
import z from 'zod';

export const listTransferSchema = z.object({
    query: z.object({
        walletId: objectIdSchema,
        count: z.coerce.number().int().positive().optional(),
        skip: z.coerce.number().int().positive().optional(),
    }),
});

export const sendTransferSchema = z.object({
    body: z.object({
        attestationResponse: authenticateResponseSchema,
        address: z.string(),
        amount: z.bigint().positive(),
        substractFee: z.boolean().optional(),
        replacable: z.boolean().optional(),
        estimateMode: z.enum(['unimportant', 'normal', 'important']).optional(),
    }),

    query: z.object({
        walletId: objectIdSchema,
    }),
});

export const retrieveWalletTransferSchema = z.object({
    params: z.object({
        transferId: z.string(),
    }),

    query: z.object({
        walletId: objectIdSchema,
    }),
});

export const setTransactionFeeSchema = z.object({
    body: z.object({
        fee: z.bigint().positive(),
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
