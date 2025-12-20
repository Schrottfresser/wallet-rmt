import { objectIdSchema } from '@server/route/validation/index.js';
import z from 'zod';

export const createWalletSchema = z.object({
    body: z.object({
        name: z.string(),
        type: z.enum(['bitcoin', 'monero']),
        remoteName: z.string(),
    }),
});

export const retrieveWalletSchema = z.object({
    params: z.object({
        walletId: objectIdSchema,
    }),
});

export const deleteWalletSchema = z.object({
    params: z.object({
        walletId: objectIdSchema,
    }),
});

export const refreshWalletSchema = z.object({
    params: z.object({
        walletId: objectIdSchema,
    }),
});

export const unlockWalletSchema = z.object({
    body: z.object({
        password: z.string(),
    }),

    params: z.object({
        walletId: objectIdSchema,
    }),
});

export const changeWalletPasswordSchema = z.object({
    body: z.object({
        newPassword: z.string(),
        oldPassword: z.string().optional(),
    }),

    params: z.object({
        walletId: objectIdSchema,
    }),
});

export const createWalletAddressSchema = z.object({
    params: z.object({
        walletId: objectIdSchema,
    }),
});
