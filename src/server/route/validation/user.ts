import { authenticateResponseSchema, registrationResponseSchema } from '@server/route/validation/webAuthn.js';
import z from 'zod';

export const registerOptionsSchema = z.object({
    body: z.object({
        username: z.string(),
    }),
});

export const registerSchema = z.object({
    body: z.object({
        username: z.string(),
        attestationResponse: registrationResponseSchema,
    }),
});

export const loginOptionsSchema = z.object({
    body: z.object({
        username: z.string(),
        newCredentialId: z.string().optional(),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        username: z.string(),
        attestationResponse: authenticateResponseSchema,
    }),
});

export const addPassphraseSchema = z.object({
    body: z.object({
        attestationResponse: authenticateResponseSchema,
        newAttestationResponse: authenticateResponseSchema,
    }),
});
