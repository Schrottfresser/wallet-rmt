import { objectIdSchema } from "@server/api/validation/index.js";
import z from "zod";

export const createWalletSchema = z.object({
    body: z.object({
        name: z.string(),
        remote: objectIdSchema,
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

export const loadWalletSchema = z.object({
    params: z.object({
        walletId: objectIdSchema,
    }),
});

export const unloadWalletSchema = z.object({
    params: z.object({
        walletId: objectIdSchema,
    }),
});

export const encryptWalletSchema = z.object({
    body: z.object({
        passphrase: z.string(),
    }),

    params: z.object({
        walletId: objectIdSchema,
    }),
});

export const changeWalletPassphraseSchema = z.object({
    body: z.object({
        oldPassphrase: z.string(),
        newPassphrase: z.string(),
    }),

    params: z.object({
        walletId: objectIdSchema,
    }),
});

export const lockWalletSchema = z.object({
    params: z.object({
        walletId: objectIdSchema,
    }),
});

export const unlockWalletSchema = z.object({
    body: z.object({
        passphrase: z.string(),
        timeout: z.number().positive(),
    }),

    params: z.object({
        walletId: objectIdSchema,
    }),
});
