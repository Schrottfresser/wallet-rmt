import { objectIdSchema } from '@server/route/validation/index.js';
import { authenticateResponseSchema } from '@server/route/validation/webAuthn.js';
import z from 'zod';

export const createWalletSchema = z.object({
    body: z.object({
        attestationResponse: authenticateResponseSchema,
        name: z.string(),
        type: z.enum(['bitcoin', 'monero']),
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

export const openWalletSchema = z.object({
    body: z.object({
        password: z.string().optional(),
    }),

    params: z.object({
        walletId: objectIdSchema,
    }),
});

export const closeWalletSchema = z.object({
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
