import { objectIdSchema } from "@server/api/validation/index.js";
import z from "zod";

export const createRemoteSchema = z.object({
    body: z.object({
        type: z.enum(["bitcoin", "monero"]),
        url: z.url({
            protocol: /^https?$/,
        }),
        username: z.string().optional(),
        password: z.string().optional(),
    }),
});

export const retrieveRemoteSchema = z.object({
    params: z.object({
        remoteId: objectIdSchema,
    }),
});

export const editRemoteSchema = z.object({
    body: z.object({
        type: z.enum(["bitcoin", "monero"]),
        url: z.url({
            protocol: /^https?$/,
        }),
        username: z.string().optional(),
        password: z.string().optional(),
    }),
    params: z.object({
        remoteId: objectIdSchema,
    }),
});

export const deleteRemoteSchema = z.object({
    params: z.object({
        remoteId: objectIdSchema,
    }),
});
